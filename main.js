
import {Layer, Tile as TileLayer} from 'ol/layer.js';
import {Map, View, Overlay} from 'ol';
import Feature from 'ol/Feature.js';
//import OSM from 'ol/source/OSM';

import csv from './emdat_earthquake.csv'
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



let csvData  = csv;
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


// For D3 integration
// https://openlayers.org/en/latest/examples/d3.html


// sample d3 integration
// class CanvasLayer extends Layer {
//   constructor(options) {
//     super(options);

//     this.features = options.features;

//     this.svg = d3
//       .select(document.createElement('div'))
//       .append('svg')
//       .style('position', 'absolute');

//     this.svg.append('path').datum(this.features).attr('class', 'boundary');
//   }

//   getSourceState() {
//     return 'ready';
//   }

//   render(frameState) {
//     const width = frameState.size[0];
//     const height = frameState.size[1];
//     const projection = frameState.viewState.projection;
//     const d3Projection = d3.geoMercator().scale(1).translate([0, 0]);
//     let d3Path = d3.geoPath().projection(d3Projection);

//     const pixelBounds = d3Path.bounds(this.features);
//     const pixelBoundsWidth = pixelBounds[1][0] - pixelBounds[0][0];
//     const pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];

//     const geoBounds = d3.geoBounds(this.features);
//     const geoBoundsLeftBottom = fromLonLat(geoBounds[0], projection);
//     const geoBoundsRightTop = fromLonLat(geoBounds[1], projection);
//     let geoBoundsWidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
//     if (geoBoundsWidth < 0) {
//       geoBoundsWidth += getWidth(projection.getExtent());
//     }
//     const geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];

//     const widthResolution = geoBoundsWidth / pixelBoundsWidth;
//     const heightResolution = geoBoundsHeight / pixelBoundsHeight;
//     const r = Math.max(widthResolution, heightResolution);
//     const scale = r / frameState.viewState.resolution;

//     const center = toLonLat(getCenter(frameState.extent), projection);
//     const angle = (-frameState.viewState.rotation * 180) / Math.PI;

//     d3Projection
//       .scale(scale)
//       .center(center)
//       .translate([width / 2, height / 2])
//       .angle(angle);

//     d3Path = d3Path.projection(d3Projection);
//     d3Path(this.features);

//     this.svg.attr('width', width);
//     this.svg.attr('height', height);

//     this.svg.select('path').attr('d', d3Path);

//     return this.svg.node();
//   }
// }

// https://openlayers.org/en/latest/examples/side-by-side.html

// const convexHullFill = new Fill({
//   color: 'rgba(255, 153, 0, 0.4)',
// });
// const convexHullStroke = new Stroke({
//   color: 'rgba(204, 85, 0, 1)',
//   width: 1.5,
// });
// const outerCircleFill = new Fill({
//   color: 'rgba(255, 153, 102, 0.3)',
// });
// const innerCircleFill = new Fill({
//   color: 'rgba(255, 165, 0, 0.7)',
// });
// const textFill = new Fill({
//   color: '#fff',
// });
// const textStroke = new Stroke({
//   color: 'rgba(0, 0, 0, 0.6)',
//   width: 3,
// });
// const innerCircle = new CircleStyle({
//   radius: 14,
//   fill: innerCircleFill,
// });
// const outerCircle = new CircleStyle({
//   radius: 20,
//   fill: outerCircleFill,
// });

// const style = new Style({
//   fill: new Fill({
//     color: 'rgba(255, 255, 255, 0.2)',
//   }),
//   stroke: new Stroke({
//     color: '#33cc33',
//     width: 2,
//   }),
//   image: new CircleStyle({
//     radius: 7,
//     fill: new Fill({
//       color: '#ffcc33',
//     }),
//   }),
// });

// const vector = new VectorLayer({
//   source: source,
//   style: function (feature) {
//     const geometry = feature.getGeometry();
//     return geometry.getType() === 'GeometryCollection' ? geodesicStyle : style;
//   },
// });

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


function getFeatures(quadrantData, field){
  //Let's cycle through the JSON data.  
  //let projection = map2.getView().getProjection();
  let magnitudes = [];
  for(let i = 0; i < quadrantData.length; i++){
    let data = quadrantData[i];
    console.log(data)
    let fieldData = data[field || "Dis Mag Value"].replace(/[^0-9.]/g,'');
    console.log(fieldData)
    let magnitude = Number(fieldData);
    magnitudes.push(magnitude)
  }

  let normalizedMags = [];
  let maxMag =  Math.max(...magnitudes)
  let minMag = Math.min(...magnitudes)
  console.log(normalizedMags)
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
    console.log(magnitude)
    let feature = new Feature(//point
    //1e6
        {geometry: new Circle(fromLonLat(point, get("EPSG:3857")),(1000000/2)*magnitude )}
      )
    feature.set("data", data)
    features.push(feature);    
  } 

  return features
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

const map1 = new Map({
  target: 'map1',
  layers: [new TileLayer({source: new OSM()}), vectorLayer1],
  view: view,
});

const map2 = new Map({
  target: 'map2',
  layers: [new TileLayer({source: new OSM()}), vectorLayer2],
  view: view,
});

const map3 = new Map({
  target: 'map3',
  layers: [new TileLayer({source: new OSM()}), vectorLayer3],
  view: view,
});

const map4 = new Map({
  target: 'map4',
  layers: [new TileLayer({source: new OSM()}), vectorLayer4],
  view: view,
});

const maps = [map1, map2, map3, map4]
const featureLayers = [vectorLayer1, vectorLayer2, vectorLayer3, vectorLayer4]



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



/**
 * TODO: Load the jsn data
 */
// d3.json('PATH_TO_JSON').then(function (us) {
//   const layer = new CanvasLayer({
//     features: topojson.feature(us, us.objects.counties),
//   });

//   map.addLayer(layer);
// });

//drop down change handler

let dropDownChange = (e, i) => {  
  refreshMaps(csvData, e.target.value, i)
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
const refreshMaps = (data, field = null, i = null) => {
  const refreshMap = (m, mNumber) => {
    console.log(mNumber)
    console.log( $("#select" + (mNumber + 1)).val())
    let selectedField = field || $("#select" + (mNumber + 1)).val()
    let features = getFeatures(data, selectedField)
    console.log(features)
    const mSource = new VectorSource({
      features: features,
      style: {
        'circle-radius': 30,
        'circle-fill-color':"red"
      }
    })
    let l = m.getLayers().getArray()[1];
    l.setSource(mSource);
  }

  if (!i) {
    maps.forEach((m, mNumber) => {
      console.log(m, mNumber)
      refreshMap(m, mNumber)
  })} else {
    let m = maps[i - 1];
    refreshMap(m)
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


function getUniqueValues(data, fieldName) {
  let uniqueValues = new Set();
  for (let item of data) {
    uniqueValues.add(item[fieldName]);
  }
  return Array.from(uniqueValues);
}


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


  map.on('singleclick', displayTooltip);
  $("#tooltip").css("font-size", 12);
});

//todo
function getFilteredQuadrantData(i) {

}


//wire slider
function getMinMaxYear(objects) {
  let minYear = Number.MAX_SAFE_INTEGER;
  let maxYear = Number.MIN_SAFE_INTEGER;
  console.log(objects)
  console.log('w')
  for (let i = 0; i < objects.length; i++) {
    const year = objects[i]['Year'];
    console.log(i)
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
    "min" : min         
  });

  $("#toSlider").attr({
    "max" : max,        
    "min" : min     
  });

  console.log(min)
  $("#fromSlider").val(min)
  $("#toSlider").val(max)
}

//TODo generalize a refreshSliderDataMethod
$("#fromSlider").on("change", (e) => {
  //todo use intermediate for csvData
  //todo create a global context for quadrant data
  csvData = csvData.filter((obj) => {
    return parseInt(obj['Year']) >= e.target.value
  
  })
  console.log(csvData)
});
  


$("#toSlider").on("change", (e)=> {
  csvData = csvData.filter((obj) => {
    return parseInt(obj['Year']) <= e.target.value
  
  })
  console.log(csvData)
});
  


refreshSlider();