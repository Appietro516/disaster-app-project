import Map from 'ol/Map.js';
//import Stamen from 'ol/source/Stamen.js';
import View from 'ol/View.js';
import {Layer, Tile as TileLayer} from 'ol/layer.js';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import {getCenter, getWidth} from 'ol/extent.js';
import OSM from 'ol/source/OSM';
import csv from './emdat_earthquake.csv'


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

  getSourceState() {
    return 'ready';
  }

  render(frameState) {
    const width = frameState.size[0];
    const height = frameState.size[1];
    const projection = frameState.viewState.projection;
    const d3Projection = d3.geoMercator().scale(1).translate([0, 0]);
    let d3Path = d3.geoPath().projection(d3Projection);

    const pixelBounds = d3Path.bounds(this.features);
    const pixelBoundsWidth = pixelBounds[1][0] - pixelBounds[0][0];
    const pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];

    const geoBounds = d3.geoBounds(this.features);
    const geoBoundsLeftBottom = fromLonLat(geoBounds[0], projection);
    const geoBoundsRightTop = fromLonLat(geoBounds[1], projection);
    let geoBoundsWidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
    if (geoBoundsWidth < 0) {
      geoBoundsWidth += getWidth(projection.getExtent());
    }
    const geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];

    const widthResolution = geoBoundsWidth / pixelBoundsWidth;
    const heightResolution = geoBoundsHeight / pixelBoundsHeight;
    const r = Math.max(widthResolution, heightResolution);
    const scale = r / frameState.viewState.resolution;

    const center = toLonLat(getCenter(frameState.extent), projection);
    const angle = (-frameState.viewState.rotation * 180) / Math.PI;

    d3Projection
      .scale(scale)
      .center(center)
      .translate([width / 2, height / 2])
      .angle(angle);

    d3Path = d3Path.projection(d3Projection);
    d3Path(this.features);

    this.svg.attr('width', width);
    this.svg.attr('height', height);
    this.svg.append("text")
    .attr("x", "230")
    .attr("y", "380")
    .attr("text-anchor", "middle")
    .style("font-size", "18px")
    .text(this.dim);

    for (let i=0; i < this.features.length; i++) {
      this.svg
      .append("circle")
      .attr("cx", this.features[i]["Total Deaths"])
      .attr("cy", this.features[i]["Total Deaths"])
      .attr("r", 3)
      .append("title").text(this.dim + ": " + this.features[i][this.dim]);
      //.on("mouseover", (event, dot) => 
      //  onMouseOver(event, dot, this.svg, i));
    }

    this.svg.select('path').attr('d', d3Path);

    //return null;
    return this.svg.node();
  }
}


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

console.log(csv[6].Year)
console.log(csv[6].Latitude)
//let header = csv[6].split(',');


const map1 = new Map({
  layers: [new TileLayer({source: new OSM()})],
  target: 'map1',
  view: view,
});

const map2 = new Map({
  layers: [new TileLayer({source: new OSM()})],
  target: 'map2',
  view: view,
});

const map3 = new Map({
  layers: [new TileLayer({source: new OSM()})],
  target: 'map3',
  view: view,
});



/**
 * Load the topojson data and create an ol/layer/Image for that data.
 */
/*
d3.json('data/topojson/us.json').then(function (us) {
  const layer = new CanvasLayer({
    features: topojson.feature(us, us.objects.counties),
  });

  map.addLayer(layer);
});
*/
let dims = ["Dis Mag Value", "Total Deaths", "Total Damages ('000 US$)"];
let dummy_data = 
  [{"Dis Mag Value": 1, "Total Deaths": 100, "Total Damages ('000 US$)": 1000},
  {"Dis Mag Value": 2, "Total Deaths": 200, "Total Damages ('000 US$)": 2000},
  {"Dis Mag Value": 3, "Total Deaths": 300, "Total Damages ('000 US$)": 3000}];

const layer1 = new CanvasLayer({
    features: dummy_data,
    dim : dims[0]
  });
map1.addLayer(layer1);

const layer2 = new CanvasLayer({
    features: dummy_data,
    dim : dims[1]
  });
map2.addLayer(layer2);

const layer3 = new CanvasLayer({
    features: dummy_data,
    dim : dims[2]
  });
map3.addLayer(layer3);

/*
function onMouseOver(event, dot, canvas, i) {
  //canvas.append("rect")
  //.attr("")
  d3.selectAll("circle").append("title").text("popout");
}
*/