import KML from 'ol/format/KML.js';
import {Heatmap as HeatmapLayer,Layer, Tile as TileLayer} from 'ol/layer.js';
import {getCenter, getWidth} from 'ol/extent.js';
import earthquakeData from './data/OtherCSV/emdat_earthquake.csv'
import emdat_data from './data/emdat_data.csv'
import './style.css';
import {Map, View} from 'ol';
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

//global JsonData


let csvData  = emdat_data;

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

const layer = new TileLayer({source: new OSM()})

// const map = new Map({
//   target: 'map1',
//   layers: [
//     new TileLayer({
//       source: new OSM()
//     })
//   ],
//   view: new View({
//     center: [0, 0],
//     zoom: 2
//   })
// });


let features = initializeQuadrant(1, csvData);

function initializeQuadrant(quadrantNum, quadrantData, field){
  //Let's cycle through the JSON data.  
  //let projection = map2.getView().getProjection();
  let features = [];
  for(let i = 0; i < quadrantData.length; i++){
    let data = quadrantData[i];
    let longitude = Number(data.Longitude.replace(new RegExp("[A-Za-z]", ""), ""));
    let magnitude = Number(data[field || "Dis Mag Value"]);
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
    features.push(feature);    
  } 

  return features
}


const geojsonObject = {
  'type': 'FeatureCollection',
  'crs': {
    'type': 'name',
    'properties': {
      'name': 'EPSG:3857',
    },
  },
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-5e6, 6e6],
            [-5e6, 8e6],
            [-3e6, 8e6],
            [-3e6, 6e6],
            [-5e6, 6e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-2e6, 6e6],
            [-2e6, 8e6],
            [0, 8e6],
            [0, 6e6],
            [-2e6, 6e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [1e6, 6e6],
            [1e6, 8e6],
            [3e6, 8e6],
            [3e6, 6e6],
            [1e6, 6e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-2e6, -1e6],
            [-1e6, 1e6],
            [0, -1e6],
            [-2e6, -1e6],
          ],
        ],
      },
    },
  ],
};

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

const map1 = new Map({
  target: 'map1',
  layers: [new TileLayer({source: new OSM()})],
  view: view,
});

const map2 = new Map({
  target: 'map2',
  layers: [new TileLayer({source: new OSM()}), circleMagLayer],
  view: view,
});

const map3 = new Map({
  target: 'map3',
  layers: [new TileLayer({source: new OSM()}), heatMapLayer],
  view: view,
});

const map4 = new Map({
  target: 'map4',
  layers: [new TileLayer({source: new OSM()})],
  view: view,
});

// event handler for when quadrant dropdown menus change


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
console.log(earthquakeData[0])
let dims = Object.entries(earthquakeData[0]).filter(([_,y]) => y != '' && !isNaN(y)).map(([x,_]) => x)

function getUniqueValues(data, fieldName) {
  let uniqueValues = new Set();
  for (let item of data) {
    uniqueValues.add(item[fieldName]);
  }
  return Array.from(uniqueValues);
}

let opts = getUniqueValues(emdat_data, "Disaster Type")
// let opts = [];
// disasterDataSet.forEach(function(currentData){
//   opts = opts.concat(getUniqueValues(currentData, "Disaster Type"))
// })

console.log(opts)



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

  // rotate dims
  let firstElement = dims.shift();
  dims.push(firstElement);
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
  console.log('woop2')
  console.log(e.target.value)
  console.log(i)
  
  let features = initializeQuadrant(i, csvData, e.target.value)
  const mSource = new VectorSource({
    features: features,
    style: {
      'circle-radius': 30,
      'circle-fill-color':"red"
    }
  })
  let l = map2.getLayers().getArray()[1];
  l.setSource(mSource)

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
    let features = initializeQuadrant(1, csvData);
    const mSource = new VectorSource({
      features: features,
      style: {
        'circle-radius': 30,
        'circle-fill-color':"red"
      }
    })
    let l = map2.getLayers().getArray()[1];
    l.setSource(mSource)

  };

  reader.readAsText(f)
})
