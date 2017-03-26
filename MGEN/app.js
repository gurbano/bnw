var MapFactory = require('./MapFactory');
var CanvasRenderer = require('./renderers/CanvasRenderer')
var raf = require('raf');
var WIDTH = 800,
	HEIGHT = 600,
	ZONES = 10
	;
var App = function App() {
	var self = this;
	this.R = new CanvasRenderer({canvas: 'voronoiCanvas', width: WIDTH, height: HEIGHT});
	this.MF = new MapFactory({sites:ZONES, width: WIDTH, height: HEIGHT});
	var looper = function (argument) {
		this.loop(this.handle || 0);
		this.handle = raf(looper.bind(this));
	}	
	this.start = function () {
		this.MF.init();
		this.handle = raf(looper.bind(this));
	}
	var initUI = function () {
		document.getElementById('btn_gp').onclick = function () {
			console.log('genero punti');
			self.MF.generatePoints();
		};
		document.getElementById('btn_vor').onclick = function () {
			console.log('genero voronoi');
			self.MF.voronoiPass();
		};
		document.getElementById('btn_rel').onclick = function () {
			console.log('rilasso voronoi');
			self.MF.relaxPass();
		};


	}
	initUI();
}
App.prototype.loop = function(count) {
	//console.log(this.handle);
	this.R.render(this.MF.getMap());
};

var app = new App();
app.start();


/*
//MF.init();
MF.debug();
MF.generatePoints();
MF.debug();
MF.voronoiPass();
MF.debug();




//Render
//R.init();
R.render();

*/