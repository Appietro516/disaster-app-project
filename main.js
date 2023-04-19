import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
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
  // new Style({
  //   stroke: new Stroke({
  //     color: 'blue',
  //     width: 3,
  //   }),
  //   fill: new Fill({
  //     color: 'rgba(255, 0, 0, 0.1)',
  //   }),
  // }),
  // new Style({
  //   image: new CircleStyle({
  //     radius: 5,
  //     fill: new Fill({
  //       color: 'orange',
  //     }),
  //   }),
  //   geometry: function (feature) {
  //     // return the coordinates of the first ring of the polygon
  //     const coordinates = feature.getGeometry().getCoordinates()[0];
  //     return new MultiPoint(coordinates);
  //   },
  // }),
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

console.log(csv[5].Year)
console.log(csv[5].Latitude)


let features = [];
initializeQuadrant(1, csv);

function initializeQuadrant(quadrantNum, quadrantData){
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
    features.push(feature);    
  } 
  
}



const image = new CircleStyle({
  radius: 5,
  fill: null,
  stroke: new Stroke({color: 'red', width: 1}),
});

const vectorLayer2 = new VectorLayer({
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
  layers: [new TileLayer({source: new OSM()})],
  view: view,
});

const map2 = new Map({
  target: 'map2',
  layers: [new TileLayer({source: new OSM()}), vectorLayer2],
  view: view,
});

const map3 = new Map({
  target: 'map3',
  layers: [new TileLayer({source: new OSM()})],
  view: view,
});

// Open question: how do we switch off of map views for graph/line charts?
const map4 = new Map({
  target: 'map4',
  layers: [new TileLayer({source: new OSM()})],
  view: view,
});
