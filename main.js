import KML from 'ol/format/KML.js';
import {Heatmap as HeatmapLayer,Layer, Tile as TileLayer} from 'ol/layer.js';
import {getCenter, getWidth} from 'ol/extent.js';
import earthquakeData from './data/OtherCSV/emdat_earthquake.csv'
import emdat_data from './data/emdat_data.csv'
import './style.css';
import {Map, View, Overlay} from 'ol';
import Feature from 'ol/Feature.js';
//import OSM from 'ol/source/OSM';

import VectorLayer from 'ol/layer/Vector.js'
import MultiPoint from 'ol/geom/MultiPoint.js'

import GeoJSON from 'ol/format/GeoJSON'
import {Circle, GeometryCollection, Point, Polygon} from 'ol/geom.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {fromLonLat, toLonLat, get} from 'ol/proj.js';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
} from 'ol/style.js';

import $ from "jquery";

///Global Constants
const VISUAL_TYPE_CIRCLES = 0;
const VISUAL_TYPE_HEAT_MAP = 1;
let visualTypeOptions = [VISUAL_TYPE_CIRCLES, VISUAL_TYPE_HEAT_MAP];
let visualTypeOptionsNames = ["Circles", "Heat Map"];
let visualTypeArray = [VISUAL_TYPE_CIRCLES, VISUAL_TYPE_CIRCLES, VISUAL_TYPE_CIRCLES,VISUAL_TYPE_CIRCLES];

let csvData  = emdat_data;
let csvDataSource = emdat_data; //todo propagate

let features = getFeatures(csvData);
refreshDropdowns(csvData)




class CanvasLayer extends Layer {
  constructor(options, dim) {
    super(options);

    this.features = options.features;
    this.dim = options.dim;

    this.svg = d3
      .select(document.createElement('div'))
      .append('svg')
      .style('position', 'absolute');

    //this.svg.append('path').datum(this.features).attr('class', 'boundary');
  }
}

const styles = [
  /* We are using two different styles for the polygons:
   *  - The first style is for the polygons themselves.
   *  - The second style is to draw the vertices of the polygons.
   *    In a custom `geometry` function the vertices of a polygon are
   *    returned as `MultiPoint` geometry, which will be used to render
   *    the style.
   */
  new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }),
  new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: 'orange',
      }),
    }),
    geometry: function (feature) {
      // return the coordinates of the first ring of the polygon
      const coordinates = feature.getGeometry().getCoordinates()[0];
      return new MultiPoint(coordinates);
    },
  }),
];


const view = new View({
  center: [0, 0],
  zoom: 2
})


function getFeatures(quadrantData, field, visualType = VISUAL_TYPE_CIRCLES){
  //Let's cycle through the JSON data.  
  //let projection = map2.getView().getProjection();
  let magnitudes = [];
  for(let i = 0; i < quadrantData.length; i++){
    let data = quadrantData[i];
    let selected_field = data.hasOwnProperty(field) ? field : "Dis Mag Value"
    let fieldData = data[selected_field].replace(/[^0-9.]/g,'');
    
    let magnitude = Number(fieldData);
    magnitudes.push(magnitude)
  }

  let normalizedMags = [];
  let maxMag =  Math.max(...magnitudes)
  let minMag = Math.min(...magnitudes)
  //console.log(normalizedMags)
  magnitudes.forEach((m) => {
    let normal =  (m - minMag) / (maxMag - minMag)
    normalizedMags.push(normal)
  });
  

  let features = [];
  for(let i = 0; i < quadrantData.length; i++){
    let data = quadrantData[i];
    let longitude = Number(data.Longitude.replace(new RegExp("[A-Za-z]", ""), ""));
    let magnitude = normalizedMags[i];
    if(isNaN(longitude)){
      let test = 0;   
    }
    let latitude = Number(data.Latitude.replace(new RegExp("[A-Za-z]", "")));
    let point = [longitude, latitude];
    //let center = transform(fromLonLat([-122.48, 37.67]))
    let center =  [-122.48, 37.67];
    //console.log(magnitude)
    let feature = null;
    if(visualType == VISUAL_TYPE_CIRCLES){
       feature = new Feature(//point

        {geometry: new Circle(fromLonLat(point, get("EPSG:3857")),(1000000/2)*magnitude)}
      )     
      feature.set("data", data)   
    }
    else{
      feature = {
        type: "Feature",
        geometry: {
        type:"Point",
        coordinates:fromLonLat(point, get("EPSG:3857")),
        data: data
       },
       properties: {magnitude: magnitude}
      }
    }    
    
    features.push(feature);  
    
  } 

  return features
}

function createNewVectorLayer(layerFeatures){
  return new VectorLayer({
    source: new VectorSource({
      features: layerFeatures,
      style: {
        'circle-radius': 30,
        'circle-fill-color':"red"
      }
    })
  })
}

function createVectorLayerFromSource(vectorSource){
  return new VectorLayer({
    source: vectorSource}
    )  
}

function createHeatLayerFromSource(vectorSource){
  const heatMapLayer = new HeatmapLayer({
    source: vectorSource,
    blur: 15,
    radius: 10,
    weight: function (feature) {
      // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
      // standards-violating <magnitude> tag in each Placemark.  We extract it from
      // the Placemark's name instead.
      //const name = feature.get('name');
      const magnitude = feature.values_.magnitude;//parseFloat(name.substr(2));
      return magnitude;
    },
  });
  return heatMapLayer;
}


const vectorLayer1 = new VectorLayer({
  source: new VectorSource({
    features: features,
    style: {
      'circle-radius': 30,
      'circle-fill-color':"red"
    }
  })
})

const vectorLayer2 = new VectorLayer({
  source: new VectorSource({
    features: features,
    style: {
      'circle-radius': 30,
      'circle-fill-color':"red"
    }
  })
})

const vectorLayer3 = new VectorLayer({
  source: new VectorSource({
    features: features,
    style: {
      'circle-radius': 30,
      'circle-fill-color':"red"
    }
  })
})

const vectorLayer4 = new VectorLayer({
  source: new VectorSource({
    features: features,
    style: {
      'circle-radius': 30,
      'circle-fill-color':"red"
    }
  })
})

let circleRadiiLayerFeatures = [];
let heatMapLayerFeatures = [];
let heatMapData = {
  type: "FeatureCollection",
  features: heatMapLayerFeatures
};

let testCoordinates = [];
initializeCircleRadiiQuadrant(1, earthquakeData);
initializeHeatMapQuadrant(earthquakeData)

function initializeCircleRadiiQuadrant(quadrantNum, quadrantData){
  //Let's cycle through the JSON data.  
  //let projection = map2.getView().getProjection();
  for(let i = 0; i < quadrantData.length; i++){
    let data = quadrantData[i];
    let longitude = Number(data.Longitude.replace(new RegExp("[A-Za-z]", ""), ""));
    let magnitude = Number(data["Dis Mag Value"]);
    if(isNaN(longitude)){
      let test = 0;   
    }
    let latitude = Number(data.Latitude.replace(new RegExp("[A-Za-z]", "")));
    let point = [longitude, latitude];
    //let center = transform(fromLonLat([-122.48, 37.67]))
    let center =  [-122.48, 37.67];
    let feature = new Feature(//point
    //1e6
        {geometry: new Circle(fromLonLat(point, get("EPSG:3857")),10000*magnitude )}
      )
    circleRadiiLayerFeatures.push(feature);    
  } 
  
}


function initializeHeatMapQuadrant(quadrantData){
  const e = 4500000;
  for(let i = 0; i < quadrantData.length; i++){
    let data = quadrantData[i];
    let longitude = Number(data.Longitude.replace(new RegExp("[A-Za-z]", ""), ""));
    let magnitude = Number(data["Dis Mag Value"]);
    if(isNaN(longitude)){
      let test = 0;   
    }
    let latitude = Number(data.Latitude.replace(new RegExp("[A-Za-z]", "")));
    let point = [longitude, latitude];
    //let center = transform(fromLonLat([-122.48, 37.67]))
    testCoordinates.push(point);
    let center =  [-122.48, 37.67];
    let feature = {
      type: "Feature",
      geometry: {
      type:"Point",
      coordinates:fromLonLat(point, get("EPSG:3857"))
     },
     properties: {magnitude:magnitude}
    }       
      heatMapLayerFeatures.push(feature);    
  } 
}



const image = new CircleStyle({
  radius: 5,
  fill: null,
  stroke: new Stroke({color: 'red', width: 1}),
});

const circleMagLayer = new VectorLayer({
  source: new VectorSource({
    features: circleRadiiLayerFeatures,
    style: {
      'circle-radius': 30,
      'circle-fill-color':"red"
    }
  })
})

const heatMapLayer = new HeatmapLayer({
  source: new VectorSource({
    features:new GeoJSON().readFeatures(heatMapData,{
      dataProjection: "EPSG:3857",
      featureProject: "EPSG:3857"
    })
    //coordinates: testCoordinates,
    // url: './2012_Earthquakes_Mag5.kml',
    //  format: new KML({
    //    extractStyles: false,
    //  }),
  }),
  blur: 15,
  radius: 10,
  weight: function (feature) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    //const name = feature.get('name');
    const magnitude = feature.values_.magnitude;//parseFloat(name.substr(2));
    return magnitude;
  },
});

let maps = [];
InitializeMaps();
function InitializeMaps(){
  let initialLayers = [vectorLayer1, circleMagLayer, heatMapLayer, vectorLayer4];
  initialLayers.forEach(function(layer, index){
    let map = createNewMap(index+1, layer );
    maps.push(map);
  })
}

function createNewMap(mapIndex, layer){
  let map = new Map({
    target: 'map' + mapIndex,
    layers: [new TileLayer({source: new OSM()}), layer],
    view: view,
  });
  return map;
}

//const maps = [map1, map2, map3, map4]


/**
 * Load the topojson data and create an ol/layer/Image for that data.
 */
/*
d3.json('data/topojson/us.json').then(function (us) {
  const layer = new CanvasLayer({
    features: topojson.feature(us, us.objects.counties),
  });

  map.addLayer(layer);
// Open question: how do we switch off of map views for graph/line charts?
const map4 = new Map({
  target: 'map4',
  layers: [new TileLayer({source: new OSM()})],
  view: view,
});

// event handler for when quadrant dropdown menus change
function dropDownChange(quadrant) {
  let dim = document.getElementById("select" + quadrant).value;
  // quadrant 1-4 specifies which map was changed,
  // dim specifies which option was selected
  console.log("Quadrant", quadrant, ":", dim);
}
*/

// dims hold the data attributes the user can pick from dropdown menu
// let dims = ["Dis Mag Value", "Total Deaths", "Total Damages ('000 US$)"];
// let disaster = csv
console.log("HI")
console.log(csvData[0])
let dims = Object.entries(csvData[0]).filter(([_,y]) => y != '' && !isNaN(y)).map(([x,_]) => x)

function getUniqueValues(data, fieldName) {
  let uniqueValues = new Set();
  for (let item of data) {
    uniqueValues.add(item[fieldName]);
  }
  return Array.from(uniqueValues);
}

let opts = getUniqueValues(csvData, "Disaster Type")
console.log(opts)



// boolean flags for whether each quadrant is map or chart
let mapOrChart = [true, true, true, true];
// function either makes a chart or restores a map for 
// quadrant q based on flags in mapOrChart
function makeChart(q) {
    // if quadrant q is a map, draw a chart
    if (mapOrChart[q-1]) {
      // toggle flag and change button label
      mapOrChart[q-1] = false;
      d3.select("#chart"+q)
        .attr('value', "Map");

      // select map div
      let sel = d3.select("#map"+q);

      // remove old svg canvas
      sel.selectAll("svg")
        .remove();

      // insert svg canvas as first child of map div 
      let svg = sel.insert("svg",":first-child")
            .attr("width", "100%")
            .attr("height", "100%")
            //.attr("style", "border:1px solid black")
            .style("position", "relative");

      // hide ol-viewport so it doesn't cover menus/buttons
      sel.selectAll(".ol-viewport")
          .style("visibility", "hidden");

      // store width/height of svg canvas
      let canvasWidth = Number((svg.style("width")).slice(0, -2));
      let canvasHeight = Number((svg.style("height")).slice(0, -2));
      
      // function filter empty strings and such from csv data
      function stringFilter(str){
        return (str != null && str !== " " && str !== "" && Number.isFinite(Number(str)));
      }

      // get data and attribute name for specific quadrant
      let scatterData = getFilteredQuadrantData(csvDataSource,q);
      let chosenField = scatterData[0];

      // initialize min/max x/y values to set up scales
      let minY = Number(scatterData[1][0][chosenField]);
      let maxY = Number(scatterData[1][0][chosenField]);
      let minX = Number(scatterData[1][0]["Year"]);
      let maxX = Number(scatterData[1][0]["Year"]);
      
      // create xy coordinate pairs from scatterData, filtering points without
      // valid attributes, and push into scatterPoints array
      // get min/max x/y values as well
      let scatterPoints = [];
      for (let i = 0; i < scatterData[1].length; i++) {
        if (! stringFilter(scatterData[1][i][chosenField]) || 
            ! stringFilter(scatterData[1][i]["Year"])) {
              continue;
        }
        //console.log(scatterData[1][i]);
        let xVal = Number(scatterData[1][i]["Year"]);
        let yVal = Number(scatterData[1][i][chosenField]);
        let point = [xVal, yVal];
        scatterPoints.push(point);

        minY = Math.min(minY, yVal);
        maxY = Math.max(maxY, yVal);
        minX = Math.min(minX, xVal);
        maxX = Math.max(maxX, xVal);
      }

      // variables for chart margin/padding
      let xMargin = 30 + 4*((""+maxY).length);
      let yMargin = 40;
      let padding = 10;

      // x,y scales to translate disaster data to svg coordinates
      let xScale = d3.scaleLinear()
        .domain([minX, maxX])
        .range([xMargin, canvasWidth-(padding)]);
      let yScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range([canvasHeight-yMargin, padding]);
      // flipped y scale for yAxis
      let yScaleFlipped = d3.scaleLinear()
        .domain([minY, maxY])
        .range([padding, canvasHeight-yMargin]);

      // color scale
      let colorScale = d3.scaleLinear()
        .domain([minY, maxY])
        .range(["blue", "red"]);

      // create x,y axes
      let xAxis = d3.axisBottom().scale(xScale).ticks(10)
        .tickFormat((tick) => String(tick));
      let yAxis = d3.axisLeft().scale(yScale).ticks(10)
        .tickFormat((tick) => String(tick));

      //console.log(chosenField);
      //console.log(filtered);
      //console.log(minX, maxX, minY, maxY);
      //console.log(typeof scatterData[1][0])

      // plot points as circles
      svg.selectAll('circle')
        .data(scatterPoints)
        .enter()
        .append('circle')
        .attr("r", 4)
        .attr("cx", function(datum) { return xScale(datum[0]); })
        .attr("cy", function(datum) { return yScale(datum[1]); })
        .style('fill', function(datum) { return colorScale(datum[1]); });

      // append x,y axes
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (canvasHeight-yMargin) + ")")
        .call(xAxis);
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ",0)")
        .call(yAxis);

      // append x axis label
      svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (canvasWidth+xMargin)/2)
        .attr("y", canvasHeight - 5)
        .text("Year");
    }
    // else, quadrant q is a chart, so restore map
    else {
      // toggle flag and and change button label
      mapOrChart[q-1] = true;
      d3.select("#chart"+q)
        .attr('value', "Chart");

      // select map div
      let sel = d3.select("#map"+q);

      // restore ol-viewport visibility
      sel.selectAll(".ol-viewport")
        .style("visibility", null);

      // remove svg canvas
      sel.selectAll("svg")
        .remove();
    }
}


// for each quadrant
for (let i = 1; i < 5; i++) {

  // add event handler to each menu
  d3.select("#select" + i)
  .on("change", function(e) { dropDownChange(e, i); });

  // Q2/Q3 option specific to last quadrant
  if (i == 4) {
    d3.select("#select" + i)
    .append("option")
    .text("Q2/Q3");
  }

  // add an option for each dim to menu
  for (let j = 0; j < dims.length; j++) {
    d3.select("#select" + i)
    .append("option")
    .text(dims[j]);
  }

  for (let j = 0; j < opts.length; j++) {
    d3.select("#disaster-select" + i)
    .append("option")
    .text(opts[j]);
  }

  for(let j = 0; j < visualTypeOptions.length; j++){
    d3.select("#visual-type" + i)
    .on("change", function(e) { onVisChange(e)})
    .selectAll("option")
    .data(visualTypeOptionsNames)
    .join("option")
    .attr("value", function(d){return j})  
    .text(function(d){return d} )
    
  }
    

  
  

  // add click handler to chart-or-map buttons
  d3.select("#chart" + i)
  .on("click", function(e) { makeChart(i); });

  // rotate dims
  let firstElement = dims.shift();
  dims.push(firstElement);
}

function onVisChange(event){
  let quadrantNumber = Number(event.target.id.charAt(event.target.id.length-1));
  visualTypeArray[quadrantNumber-1] = event.target.selectedIndex;
  refreshMaps(csvData,$("#visual-type" + (event.target.value + 1)).val(),quadrantNumber , event.target.selectedIndex);
 // refreshMaps(csvData, e.target.value, i)
}

/**
 * TODO: Load the jsn data
 */
// d3.json('PATH_TO_JSON').then(function (us) {
//   const layer = new CanvasLayer({
//     features: topojson.feature(us, us.objects.counties),
//   });

//   map.addLayer(layer);

// });
// });

//drop down change handler

let dropDownChange = (e, i) => {  
  refreshMaps(csvData, e.target.value, i, visualTypeArray[i-1])
}

// File upload handler 
$("#fileForm").on("change", (e) => {
  console.log(e)
  let files = e.target.files; // FileList object
  // use the 1st file from the list
  let f = files[0];
  const reader = new FileReader(); // Create a new FileReader object
  let fileContent;

  // Define the onload function that will be called when the file is loaded
  reader.onload = function(event) {
    fileContent = event.target.result; // Get the file content as a string
    csvData = d3.csvParse(fileContent)
    refreshDropdowns(csvData)
    refreshMaps(csvData)
  };

  reader.readAsText(f)
})

//refrash all maps or map i
// const refreshMaps = (data, field = null, i = null) => {
//   const refreshMap = (m, mNumber) => {
//     console.log(mNumber)
//     console.log( $("#select" + (mNumber + 1)).val())
//     let selectedField = field || $("#select" + (mNumber + 1)).val()
//     let features = getFeatures(data, selectedField)
//     console.log(features)
//     const mSource = new VectorSource({
//       features: features,
//       style: {
//         'circle-radius': 30,
//         'circle-fill-color':"red"
//       }
//     })
//     let l = m.getLayers().getArray()[1];
//     l.setSource(mSource);
//   }

//   if (!i) {
//     maps.forEach((m, mNumber) => {
//       console.log(m, mNumber)
//       refreshMap(m, mNumber)
//   })} else {
//     let m = maps[i - 1];
//     refreshMap(m)
//   }
// }

// function refreshDropdowns(data) {
//   let dims = Object.entries(data[0]).filter(([_,y]) => y != '' && !isNaN(y)).map(([x,_]) => x)
//   let opts = getUniqueValues(data, "Disaster Type")

//   // for each quadrant
//   for (let i = 1; i < 5; i++) {
//     let elementID = "#select" + i
//     let disasterElementID = "#disaster-select" + i
//     // add event handler to each menu
//     d3.select(elementID)
//     .on("change", function(e) { dropDownChange(e, i); });

//     $(elementID).empty()

//     // Q2/Q3 option specific to last quadrant
//     if (i == 4) {
//       d3.select(elementID)
//       .append("option")
//       .text("Q2/Q3");
//     }

//     // add an option for each dim to menu
//     for (let j = 0; j < dims.length; j++) {
//       d3.select(elementID)
//       .append("option")
//       .text(dims[j]);
//     }

//     for (let j = 0; j < opts.length; j++) {
//       d3.select(disasterElementID)
//       .append("option")
//       .text(opts[j]);
//     }

//     // rotate dims
//     let firstElement = dims.shift();
//     dims.push(firstElement);

//     //select first option
//     $(elementID)[0].selectedIndex = 0;
//     $(disasterElementID)[0].selectedIndex = 0;
//   }
// }


// function getUniqueValues(data, fieldName) {
//   let uniqueValues = new Set();
//   for (let item of data) {
//     uniqueValues.add(item[fieldName]);
//   }
//   return Array.from(uniqueValues);
// }


//todo add tooltip style
maps.forEach((map, i) => {
  console.log("x")
  console.log(map)
  var tooltip = document.getElementById('tooltip' + i);
  var overlay = new Overlay({
    element: tooltip,
    offset: [10, 0],
    positioning: 'bottom-left'
  });
  map.addOverlay(overlay);

  function displayTooltip(evt) {
    var pixel = evt.pixel;
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
      return feature;
    });
    tooltip.style.display = feature ? '' : 'none';
    if (feature) {
      overlay.setPosition(evt.coordinate);
      tooltip.innerHTML = JSON.stringify(feature.get('data'), null, 2);
    }
  };

  //reader.readAsText(f)
})

//refrash all maps or map i
const refreshMaps = (data, field = null, i = null, visualType) => {
  const refreshMap = (m, mNumber) => {
    console.log(mNumber)
    console.log( $("#select" + (mNumber + 1)).val())
    let selectedField = field || $("#select" + (mNumber + 1)).val()
    let features = getFeatures(data, selectedField, visualType)
    console.log(features)
    let mSource = null; 
    //A vector source for circles

    let l = m.getLayers().getArray()[1];
    //Choose a visual type.  Circles or Heatmap
    if(visualType == VISUAL_TYPE_CIRCLES){
      mSource = new VectorSource({
        features: features,
        style: {
          'circle-radius': 30,
          'circle-fill-color':"red"
        }
      })
      m.setLayers([new TileLayer({source: new OSM()}), createVectorLayerFromSource(mSource)])
    }
    //A vector source for heat map
    else{
      let heatMapData = {
        type: "FeatureCollection",
        features: features
      };

      mSource = new VectorSource({
        features:new GeoJSON().readFeatures(heatMapData,{
          dataProjection: "EPSG:3857",
          featureProject: "EPSG:3857"
        })
      })
      m.setLayers([new TileLayer({source: new OSM()}), createHeatLayerFromSource(mSource)])
      
    }    
    
    //l.setSource(mSource);
  }

  if (!i) {
    maps.forEach((m, mNumber) => {
      //console.log(m, mNumber)
      refreshMap(m, mNumber)
  })} else {
    let m = maps[i - 1];
    refreshMap(m)

    // updates scatterplot if drawn in quadrant i
    if (! mapOrChart[i-1]) {
      mapOrChart[i-1] = true;
      makeChart(i);
    }
  }
}

function refreshDropdowns(data) {
  let dims = Object.entries(data[0]).filter(([_,y]) => y != '' && !isNaN(y)).map(([x,_]) => x)
  let opts = getUniqueValues(data, "Disaster Type")

  // for each quadrant
  for (let i = 1; i < 5; i++) {
    let elementID = "#select" + i
    let disasterElementID = "#disaster-select" + i
    // add event handler to each menu
    d3.select(elementID)
    .on("change", function(e) { dropDownChange(e, i); });

    $(elementID).empty()

    // Q2/Q3 option specific to last quadrant
    if (i == 4) {
      d3.select(elementID)
      .append("option")
      .text("Q2/Q3");
    }

    // add an option for each dim to menu
    for (let j = 0; j < dims.length; j++) {
      d3.select(elementID)
      .append("option")
      .text(dims[j]);
    }

    for (let j = 0; j < opts.length; j++) {
      d3.select(disasterElementID)
      .append("option")
      .text(opts[j]);
    }

    // rotate dims
    let firstElement = dims.shift();
    dims.push(firstElement);

    //select first option
    $(elementID)[0].selectedIndex = 0;
    $(disasterElementID)[0].selectedIndex = 0;
  }
}


// function getUniqueValues(data, fieldName) {
//   let uniqueValues = new Set();
//   for (let item of data) {
//     uniqueValues.add(item[fieldName]);
//   }
//   return Array.from(uniqueValues);
// }


//todo add tooltip style
maps.forEach((map, i) => {
  //console.log("x")
  //console.log(map)
  var tooltip = document.getElementById('tooltip' + i);
  var overlay = new Overlay({
    element: tooltip,
    offset: [10, 0],
    positioning: 'bottom-left'
  });
  map.addOverlay(overlay);

  function displayTooltip(evt) {
    var pixel = evt.pixel;
    var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
      return feature;
    });
    tooltip.style.display = feature ? '' : 'none';
    if (feature) {
      overlay.setPosition(evt.coordinate);
      tooltip.innerHTML = JSON.stringify(feature.get('data'), null, 2);
    }
  };


  map.on('singleclick', displayTooltip);
  $("#tooltip").css("font-size", 12);
});

function getFilteredQuadrantData(allData, i) {
  //filter allData by years
  let minYear = $("#fromSlider").val()
  let maxYear = $("#toSlider").val()
  let localData = allData.filter((obj) => {
    return parseInt(obj['Year']) >= minYear
  })
  
  localData = localData.filter((obj) => {
    return parseInt(obj['Year']) <= maxYear
  })

  // filter allData by disaster
  let disasterElementID = "#disaster-select" + i
  let disasterVal = $(disasterElementID).val()
  localData = localData.filter((obj) => {

    return obj['Disaster Type'] == disasterVal
  })

  //filter by field
  let field =  $("#select" + i).val()
  let fields = localData.map((obj) => obj[field])

  return [field, localData]
}



//wire slider
function getMinMaxYear(objects) {
  let minYear = Number.MAX_SAFE_INTEGER;
  let maxYear = Number.MIN_SAFE_INTEGER;
  for (let i = 0; i < objects.length; i++) {
    const year = objects[i]['Year'];
    if (year < minYear) {
      minYear = year;
    }
    if (year > maxYear) {
      maxYear = year;
    }
  }

  return [minYear, maxYear];
}

function refreshSlider() {
  let [min, max] = getMinMaxYear(csvData);
  console.log(min, max)
  //add slider wiring
  $("#fromSlider").attr({
    "max" : max,        
    "min" : min,
    "val" : min        
  });

  $("#toSlider").attr({
    "max" : max,        
    "min" : min,
    "val" : max     
  });

  console.log(min)
  $("#fromSlider").val(min)
  $("#toSlider").val(max)
}

//TODo generalize a refreshSliderDataMethod
$("#fromSlider").on("change", (e) => {
  csvData = csvDataSource.filter((obj) => {
    return parseInt(obj['Year']) >= e.target.value
  
  })
  //todo make refresh all maps
  for (let i = 1; i < 5; i++) {
    refreshMaps(csvData, $("#select" + i).val(), i)
  }
});
  


$("#toSlider").on("change", (e)=> {
  csvData = csvDataSource.filter((obj) => {
    return parseInt(obj['Year']) <= e.target.value
  })
  for (let i = 1; i < 5; i++) {
    refreshMaps(csvData, $("#select" + i).val(), i)
  }
});
  


refreshSlider();


// Here is how you call the filtering stuff
// let data = getFilteredQuadrantData(csvDataSource, 3)
// console.log(data)