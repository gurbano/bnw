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
var buildGraph = function (diagram) {
	var zones = diagram.cells.map(function (cell) {return cell.site;});
	var zonesMap = zones.reduce(function(acc, elem){acc[elem.voronoiId] = {id: elem.voronoiId,x: elem.x,y:elem.y}; return acc},{})
	var zonesVertexMap = {};
	var borderMap = {};
	var borderVertexMap = {};
	var edges = diagram.edges;
	var vertex = diagram.vertices;

	//Polygon (zones) GRAPH (nodes- zone center, edge- zones adjiacent)
	var zoneGraph = new jKstra.Graph();
	diagram.cells.map(function (cell) {
		//zoneGraph.addVertex(zonesMap)
		zonesVertexMap[cell.site.voronoiId] = zoneGraph.addVertex(zonesMap[cell.site.voronoiId],{id: cell.site.voronoiId })
	})	
	diagram.edges.map(function (edge) {
		//console.log(edge)
		if (edge.lSite && edge.rSite){
			zoneGraph.addEdge(zonesVertexMap[edge.lSite.voronoiId],zonesVertexMap[edge.rSite.voronoiId],{id: edge.lSite.voronoiId+'-'+edge.rSite.voronoiId });
			zoneGraph.addEdge(zonesVertexMap[edge.rSite.voronoiId],zonesVertexMap[edge.lSite.voronoiId],{id: edge.rSite.voronoiId+'-'+edge.lSite.voronoiId });
		}
	})

	//Borders (between zones) VORONOI GRAPH (nodes- zone center, edge- zones adjiacent)
	var borderGraph = new jKstra.Graph();
	diagram.edges.map(function (edge) {
		//console.log(edge)
		if (edge.lSite && edge.rSite){
			var createVertex = function(lSite, rSite){
				var borderId = 'b'+lSite.voronoiId+'-'+rSite.voronoiId;
				var vId0 = borderId+'-v0';
				var vId1 = borderId+'-v1';
				var v0 = {id:vId0, x:edge.va.x, y:edge.va.y}
				var v1 = {id:vId1, x:edge.vb.x, y:edge.vb.y}

				var border = {id: borderId, between:[lSite.voronoiId,rSite.voronoiId], vertices:[v0,v1]}				
				borderMap[borderId] = border;
				borderVertexMap[vId0] = borderGraph.addVertex(v0,v0);
				borderVertexMap[vId1] = borderGraph.addVertex(v1,v1);
				borderGraph.addEdge(borderVertexMap[vId0],borderVertexMap[vId1],{border:border});				
			}
			createVertex(edge.lSite, edge.rSite);		
		}
	})
	

	//console.log(zoneGraph);
	return{
		zones: zones,
		zonesMap: zonesMap, //{id: {x:.., y:..,}}
		zonesVertexMap: zonesVertexMap,
		zoneGraph: zoneGraph,

		borderMap:borderMap,
		borderVertexMap: borderVertexMap,
		borderGraph: borderGraph,
	}
};
var  toInt = function (something) {
    return something | 0;
};

var Noise = require('noisejs').Noise;
var noise = new Noise(Math.random());
var makePerlin = function(W,H){	
    return function (q) {
    	//console.log(noise.perlin2(q.x / 100, q.y / 100))
    	return noise.perlin2(q.x , q.y )>0 ;
    };
}


var VorUtils = {
	distance: distance,
	cellArea: cellArea,
	cellCentroid: cellCentroid,
	buildGraph: buildGraph,
	makePerlin: makePerlin,
}
module.exports = VorUtils;