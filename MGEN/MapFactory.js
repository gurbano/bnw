var _ = require('lodash')
var Voronoi = require('./libs/voronoi')
var defaults = {
	map: undefined,
	width: 1024,
	height: 500,
	sites: 1000,

}

var MapFactory = function (opts) {
	var self = this;
	opts = _.merge(defaults, opts || {})
	this.getOpts = function () {return opts;}

	/*starting state*/
	this.sites = [];
	this.inited = false;
	this.map = undefined;
	this.voronoi = new Voronoi();
	this.diagram = null;
	/**/

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
	this.sites = [];
	var xo = 0;
	var dx = this.getOpts().width;
	var yo = 0;
	var dy = this.getOpts().height;
	for (var i=0; i<n; i++) {
		this.sites.push({x:Math.round((xo+Math.random()*dx)*10)/10,y:Math.round((yo+Math.random()*dy)*10)/10});
	}
	console.info('punti inizializzati')
};

MapFactory.prototype.voronoiPass = function() {
	this.voronoi.recycle(this.diagram);
	this.diagram = this.voronoi.compute(this.sites, this.getBBox());
	console.log(this.diagram);
};

module.exports = MapFactory;