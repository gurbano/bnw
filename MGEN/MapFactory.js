var _ = require('lodash')
var Voronoi = require('./libs/voronoi')
var VU = require('./libs/VorUtils')
var defaults = {
	map: undefined,
	width: 1024,
	height: 768,
	sites: 1000,
}
var MapFactory = function (opts) {
	var self = this;
	opts = _.merge(defaults, opts || {})
	console.log('World options',opts);
	this.getOpts = function () {return opts;}

	/*starting state*/	
	this.timeout = undefined;
	this.timeoutDelay = 300;
	this.inited = false;
	this.map = {
		graph: undefined,
		points: [],//sites
		edges: [],//edge del diagramma di voronoi
		cells: [],
	}
	this.voronoi = new Voronoi();
	/**/
	this.data = {
		sites: [],
		diagram: null,
	}

	return this;
}
MapFactory.prototype.init = function () {
	console.info('Init', this.getOpts());
	if (this.getOpts().map){
		console.info('Loading map...');
	}else{
		console.info('Init map...');
		this.generatePoints();
		this.voronoiPass();
	}	
};
MapFactory.prototype.isInited = function() {return this.inited;};
MapFactory.prototype.getBBox = function() {
	return {xl:0,xr:this.getOpts().width,yt:0,yb:this.getOpts().width};
};

MapFactory.prototype.generatePoints = function() {
	var n = this.getOpts().sites;
	this.data.sites = [];
	var xo = 0;
	var dx = this.getOpts().width;
	var yo = 0;
	var dy = this.getOpts().height;
	for (var i=0; i<n; i++) {
		this.data.sites.push({x:Math.round((xo+Math.random()*dx)*10)/10,y:Math.round((yo+Math.random()*dy)*10)/10});
	}
	console.info('punti inizializzati')
	this.voronoiPass();
};
MapFactory.prototype.assignWater = function(){
	var self = this;
	var pValue = VU.makePerlin(this.getOpts().width, this.getOpts().height);
	var inside = function (p) {
        return pValue({ x: 2 * (p.x / this.getOpts().width - 0.5), y: 2 * (p.y / this.getOpts().height - 0.5) });
    };
    Object.keys(this.map.graph.zonesMap).map(function(key){
		var zone = self.map.graph.zonesMap[key];
		if (zone.border){
			zone.water = true;
		}else{
			zone.water = pValue({x: zone.point.x,y: zone.point.y}) //perlin + radius;	
		}		
		//console.log(zone.point.x,zone.point.y,zone.water);
	});


}
MapFactory.prototype.voronoiPass = function() {
	var self = this;
	this.voronoi.recycle(this.data.diagram);
	this.data.diagram = this.voronoi.compute(this.data.sites, this.getBBox());
	console.log('voronoiPass' ,this.data.diagram.execTime + ' ms');
	this.updateMap();
	this.updateGraph(); //build this.map.graph zonesMap
	this.assignWater(); //
	//this.printZones();
};
MapFactory.prototype.relaxPass = function(again) {
	if (!this.data.diagram) {this.voronoiPass();}
	var cells = this.data.diagram.cells,
			iCell = cells.length,
			cell,
			site, sites = [],
			again = false,
			rn, dist;
	var p = 1 / iCell * 0.1;
	while (iCell--) {
		cell = cells[iCell];
		rn = Math.random();
		// probability of apoptosis
		if (rn < p) {
			continue;
			}
		site = VU.cellCentroid(cell);
		dist = VU.distance(site, cell.site);
		//again = again || dist > 1;
		// don't relax too fast
		if (dist > 2) {
			site.x = (site.x+cell.site.x)/2;
			site.y = (site.y+cell.site.y)/2;
			}
		// probability of mytosis
		if (rn > (1-p)) {
			dist /= 2;
			sites.push({
				x: site.x+(site.x-cell.site.x)/dist,
				y: site.y+(site.y-cell.site.y)/dist,
				});
			}
		sites.push(site);
	}
	this.data.sites = sites;
	this.voronoiPass();
	if (again) {
		var me = this;
		this.timeout = setTimeout(function(){me.relaxPass();}, this.timeoutDelay);
	}
	
}
MapFactory.prototype.updateGraph = function(){
	if (this.data.diagram){
		this.map.graph = VU.buildGraph(this.data.diagram);
	}else{
		this.map.graph = undefined;
	}
	//console.log(this.data.diagram)
}

MapFactory.prototype.printZones = function() {

	var zones = {};
	var self = this;	
	Object.keys(this.map.graph.zonesMap).map(function(key){
		var zone = self.map.graph.zonesMap[key];
		console.groupCollapsed('analisi zona '+ zone.id);
		console.table(zone)
		//analisi vicini
		console.groupCollapsed('neighbours of '+ zone.id);
		console.log(zone.id, 'neighbours ->',zone.neighbours.map(function(a){return a.id;}))
		console.groupEnd();
		//analisi borders
		console.groupCollapsed('borders of '+ zone.id);
		console.log(zone.borders.length, 'borders ->',zone.borders.map(function(a){return a.id;}))
		zone.neighbours.map(function(neigh){
			console.log('between',zone.id,'e', neigh.id,'--->', self.map.graph.commonBorder(zone.id, neigh.id))
		})
		console.groupEnd();	

		//analisi corners

		console.groupEnd();		
	});
	
/*	Object.keys(zones).map(function(key){
		var zone = zones[key];
		var tmp = self.map.graph.zoneGraph.vertices.filter(function(v){return v.data.id == key;})
		var _in = tmp[0]._in.map(function(edge){return edge.from.data.id;})
		var _out = tmp[0]._out.map(function(edge){return edge.to.data.id;})
		console.log('zone',key, 'in',_in,'_out',_out)
		zone.neighbours = _in;
	});
*/

	//this.map.zones = zones;
};

MapFactory.prototype.updateMap = function() {
	this.map.sites = _.cloneDeep(this.data.sites);
	if (this.data.diagram){
		this.map.points = _.cloneDeep(this.data.diagram.vertices);
		this.map.edges = _.cloneDeep(this.data.diagram.edges);
		this.map.cells = _.cloneDeep(this.data.diagram.cells);
		
	}else{
		this.map.points = [];
		this.map.edges = [];
		this.map.cells = [];
	}
};

MapFactory.prototype.getMap = function() {
	return this.map;
};
MapFactory.prototype.debug = function() {
	var self = this;
	this.updateMap();
	console.log(Object.keys(this.map).map(function (k) {return k +' - '+(self.map[k]||[]).length}));
};

module.exports = MapFactory;