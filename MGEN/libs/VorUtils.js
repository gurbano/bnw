var jKstra = require('jkstra');

var distance = function(a, b) {
	var dx = a.x-b.x,
		dy = a.y-b.y;
	return Math.sqrt(dx*dx+dy*dy);
}
var cellArea = function(cell) {
	var area = 0,
		halfedges = cell.halfedges,
		iHalfedge = halfedges.length,
		halfedge,
		p1, p2;
	while (iHalfedge--) {
		halfedge = halfedges[iHalfedge];
		p1 = halfedge.getStartpoint();
		p2 = halfedge.getEndpoint();
		area += p1.x * p2.y;
		area -= p1.y * p2.x;
		}
	area /= 2;
	return area;
}
var cellCentroid= function(cell) {
	var x = 0, y = 0,
		halfedges = cell.halfedges,
		iHalfedge = halfedges.length,
		halfedge,
		v, p1, p2;
	while (iHalfedge--) {
		halfedge = halfedges[iHalfedge];
		p1 = halfedge.getStartpoint();
		p2 = halfedge.getEndpoint();
		v = p1.x*p2.y - p2.x*p1.y;
		x += (p1.x+p2.x) * v;
		y += (p1.y+p2.y) * v;
	}
	v = cellArea(cell) * 6;
	return {x:x/v,y:y/v};
}

// Build graph data structure in 'edges', 'centers', 'corners',
// based on information in the Voronoi results: point.neighbors
// will be a list of neighboring points of the same type (corner
// or center); point.edges will be a list of edges that include
// that point. Each edge connects to four points: the Voronoi edge
// edge.{v0,v1} and its dual Delaunay triangle edge edge.{d0,d1}.
// For boundary polygons, the Delaunay edge will have one null
// point, and the Voronoi edge may be null.
var Zone = require('../struct/center');
var Edge = require('../struct/edge');
var Corner = require('../struct/corner');
var buildGraph = function (diagram) {
	var vCells = diagram.cells.map(function (cell) {return cell.site;});
	var vEdges = diagram.edges;
	var vCorners = diagram.vertices;
	var edgesMap = {};
	var cornersMap = {};
	var zonesMap = vCells.reduce(function(acc, elem){
						let zone = new Zone();
						zone.id = elem.voronoiId;
						zone.index = elem.voronoiId;
						zone.point = {x: elem.x.toFixed(2), y: elem.y.toFixed(2)};
						zone.neighbors = []; //[zones]
						zone.borders = []; //[edges]
						zone.corners = [];//[corners]
						acc[elem.voronoiId] = zone;
						return acc},{})	
	
	
	vCells.map(function (vCell) {
		//console.log(vCell, zonesMap[vCell.voronoiId])		
	})
	var buildCorner = function(v){
		let c = new Corner();
		let vid = (v.x).toFixed(2)+'-'+(v.y).toFixed(2);
		c.id= vid;
        c.index= vid,      
        c.point= {x:v.x.toFixed(2), y:v.y.toFixed(2)};  // location 
        return c;
	}
	vEdges.map(function (vEdge) {
		if (vEdge.lSite && vEdge.rSite){
			var z0 = zonesMap[vEdge.lSite.voronoiId];
			var z1 = zonesMap[vEdge.rSite.voronoiId];
			
			var c0 = buildCorner(vEdge.va);
			var c1 = buildCorner(vEdge.vb);	
			if (!cornersMap[z0.id]){ cornersMap[z0.id] = [];}
			cornersMap[z0.id][z1.id] = [c0,c1];

			var eId = 'e'+z0.id+'-'+z1.id;			
			if (!edgesMap[z0.id]){ edgesMap[z0.id] = {};}			
			var edge = new Edge();
			edge.index = eId;
			edge.id = eId;
	        edge.d0= z0;  // Delaunay edge
	        edge.d1= z1;  // Delaunay edge
	        edge.v0= c0;  // Voronoi edge
	        edge.v1= c1;  // Voronoi edge
	        edge.midpoint= {x: ((c0.point.x + c1.point.x)/2),y: ((c0.point.y + c1.point.y)/2)};  // halfway between v0,v1
	        edge.river= 0;  // volume of water, or 0			
	        edgesMap[z0.id][z1.id] = edge;

			z0.neighbors.push(z1);
			z0.corners.push(c0);
			z0.corners.push(c1);
			z0.borders.push(edgesMap[z0.id][z1.id]);
			
			z1.neighbors.push(z0);
			z1.corners.push(c0);
			z1.corners.push(c1);
			z1.borders.push(edgesMap[z0.id][z1.id]);

			c0.zones.push(z0);
			c0.zones.push(z1);
			c0.edges.push(edgesMap[z0.id][z1.id]);
			c0.corners.push(c1);

			c1.zones.push(z0);			
			c1.zones.push(z1);
			c1.edges.push(edgesMap[z0.id][z1.id]);
			c1.corners.push(c0 );
			z0.border = false;
			z1.border = false;
			//console.log(edgesMap[eId],'edge tra',z0, 'e', z1, c0,c1);
		}else{
			//mi segno che la zona è a bordomappa
			var z = vEdge.lSite ? zonesMap[vEdge.lSite.voronoiId] : zonesMap[vEdge.rSite.voronoiId];
			var c0 = buildCorner(vEdge.va);
			var c1 = buildCorner(vEdge.vb);	
			if (!cornersMap[z.id]){ cornersMap[z.id] = [];}
			cornersMap[z.id]['outside'] = [c0,c1];

			var eId = 'e'+z.id+'-'+'out';			
			if (!edgesMap[z.id]){ edgesMap[z.id] = {};}			
			var edge = new Edge();
			edge.index = eId;
			edge.id = eId;
	        edge.d0= z;  // Delaunay edge
	        edge.d1= null;  // Delaunay edge
	        edge.v0= c0;  // Voronoi edge
	        edge.v1= c1;  // Voronoi edge
	        edge.midpoint= {x: ((c0.point.x + c1.point.x)/2),y: ((c0.point.y + c1.point.y)/2)};  // halfway between v0,v1
	        edge.river= 0;  // volume of water, or 0			
	        edgesMap[z.id]['outside'] = edge;

			z.corners.push(c0);
			z.corners.push(c1);
			z.borders.push(edgesMap[z.id]['outside']);
			
			c0.zones.push(z);
			c0.edges.push(edgesMap[z.id]['outside']);
			c0.corners.push(c1);

			c1.zones.push(z);			
			c1.edges.push(edgesMap[z.id]['outside']);
			c1.corners.push(c0 );
			z.border = true;
		}
	})

	var graphZ = new jKstra.Graph();
	Object.keys(zonesMap).map(function(key){
		var zone = zonesMap[key];
		zone.gZvertex = graphZ.addVertex(zone.id,zone);
		zone.gZedges = [];
	});
	Object.keys(zonesMap).map(function(key){
		var zone = zonesMap[key];
		zone.neighbors.map(function(neigh){
			var commonBorder = (edgesMap[zone.id]||{})[neigh.id]||(edgesMap[neigh.id]||{})[zone.id];
			/*GRAPH ZONES - edges*/
			var gEdge0 = graphZ.addEdge(zone.gZvertex, neigh.gZvertex,commonBorder);
			var gEdge1 = graphZ.addEdge(neigh.gZvertex, zone.gZvertex,commonBorder);
			zone.gZedges.push(gEdge0);
			zone.gZedges.push(gEdge1);
			//neigh.gZedges.push(gEdge0);
			//neigh.gZedges.push(gEdge1);
		})
		
	});


	var ret = {
		zonesMap: zonesMap,
		edgesMap: edgesMap,
		cornersMap: cornersMap,
		GZ: graphZ,
		commonBorder: function(z1,z2){return (edgesMap[z1]||{})[z2]||(edgesMap[z2]||{})[z1];}
	};
	return ret;
};
var  toInt = function (something) {
    return something | 0;
};

var Noise = require('noisejs').Noise;
var distanceFromCenter= function (p,w,h) {
		var c = {x: w/2, y: h/2};
        return Math.sqrt(((c.x-p.x) * (c.x-p.x)) + ((c.y-p.y) * (c.y-p.y)));
    };
var map = function (val, interval_dest, interval_source) {
	return (val - interval_source[0])*(interval_dest[1]-interval_dest[0])/(interval_source[1]-interval_source[0]) + interval_dest[0];
}

var noise = new Noise(Math.random());
var makePerlin = function(W,H,seed){	
    return function (q) {
    	//console.log(noise.perlin2(q.x / 100, q.y / 100))
    	var water_modify = -0;
    	var min_distance = 0;
    	var max_distance = distanceFromCenter({x:0,y:0},W,H);
    	var this_distance = distanceFromCenter(q,W,H);
    	var water_prob = map(this_distance,[-0,1.3],[min_distance,max_distance]);
    	var perlin = noise.perlin2((q.x/60) , (q.y/60)) ;
    	//return ((perlin) + (water_prob )  + water_modify)> - 0 ;
    	console.log(q.x , q.y, perlin)
    	return water_prob+perlin>0.4;
    };
}
var getZone = function (point, zonesMap) {
	var retZone = undefined;
	var lessDistance = Number.MAX_SAFE_INTEGER;
	Object.keys(zonesMap).map(function(key){
		var zone = zonesMap[key];
		var d = distance(point, zone.point);
		if (d < lessDistance){
			lessDistance = d;
			retZone = zone;
		}
	});
	return retZone;
}

var VorUtils = {
	distance: distance,
	cellArea: cellArea,
	cellCentroid: cellCentroid,
	buildGraph: buildGraph,
	makePerlin: makePerlin,
	getZone: getZone,
}
module.exports = VorUtils;