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
	this.updateMap();
};
MapFactory.prototype.assignWater = function(){
	var pValue = VU.makePerlin(this.getOpts().width, this.getOpts().height);
	var inside = function (p) {
        return pValue({ x: 2 * (p.x / this.getOpts().width - 0.5), y: 2 * (p.y / this.getOpts().height - 0.5) });
    };
    this.map.cells.map(function(cell){
    	//
    	var val = pValue({x: cell.site.x,y: cell.site.y});
    	//console.log(cell.site.voronoiId, cell.site.x,cell.site.y, val);
    	//console.log(val)
    	cell.water = val;
    })


}
MapFactory.prototype.voronoiPass = function() {
	var self = this;
	this.voronoi.recycle(this.data.diagram);
	this.data.diagram = this.voronoi.compute(this.data.sites, this.getBBox());
	console.log('voronoiPass' ,this.data.diagram.execTime + ' ms');
	this.updateGraph();
	this.updateMap();
	this.assignWater();
	this.updateZones();
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

var Zone = require('./struct/center.js');
var Corner = require('./struct/corner.js');
var Edge = require('./struct/edge.js');
MapFactory.prototype.updateZones = function() {
	var zones = {};
	var self = this;
	this.map.cells.map(function(cell){
		console.log(cell)
		var zone = new Zone();
		zone.index = cell.site.voronoiId;
		zone.point = {x:cell.site.x, y:cell.site.y};
		zone.water = cell.water;
		zones[cell.site.voronoiId] = zone;
	});
	Object.keys(zones).map(function(key){
		var zone = zones[key];
		var tmp = self.map.graph.zoneGraph.vertices.filter(function(v){return v.data.id == key;})
		var _in = tmp[0]._in.map(function(edge){return edge.from.data.id;})
		var _out = tmp[0]._out.map(function(edge){return edge.to.data.id;})
		console.log('zone',key, 'in',_in,'_out',_out)
	});

	this.map.zones = zones;
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
	return this.map;
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