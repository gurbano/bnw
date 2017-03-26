var MapFactory = require('./MapFactory');
var Commander = require('./commander/commander');
var CanvasRenderer = require('./renderers/CanvasRenderer')
var raf = require('raf');
var WIDTH = 1024,
HEIGHT = 768,
ZONES = 2500;

var App = function App() {
	var self = this;
	var canvasId = 'voronoiCanvas';
	this.canvas = document.getElementById(canvasId)
	this.R = new CanvasRenderer({canvas: canvasId, width: WIDTH, height: HEIGHT});
	this.MF = new MapFactory({sites:ZONES, width: WIDTH, height: HEIGHT});
	this.C = new Commander(this);
	var looper = function (argument) {
		this.loop(this.handle || 0);
		this.handle = raf(looper.bind(this));
	}	
	this.start = function () {
		this.MF.init();
		this.handle = raf(looper.bind(this));
	}
	var initUI = function () {
		document.getElementById('btn_rp').onclick = function () {
			console.log('resetta punti');
			console.log(self.C.execute('genera',[false]));
		};
		document.getElementById('btn_gp').onclick = function () {
			console.log('genero punti');
			console.log(self.C.execute('genera',[true]));
		};
		document.getElementById('btn_vor').onclick = function () {
			console.log('genero voronoi');
			self.MF.voronoiPass();
		};
		document.getElementById('btn_rel').onclick = function () {
			console.log('rilasso voronoi');
			self.MF.relaxPass();
		};
		function getMousePos(canvas, evt) {
	        var rect = canvas.getBoundingClientRect();
	        return {
	          x: evt.clientX - rect.left,
	          y: evt.clientY - rect.top
	        };
	      }
		self.canvas.addEventListener('mousemove', function(evt) {
			var mousePos = getMousePos(self.canvas, evt);
			self.C.execute('mousemove',[{x:mousePos.x, y: mousePos.y}])
		}, false);
		self.canvas.addEventListener('click', function(evt) {
			var mousePos = getMousePos(self.canvas, evt);
			self.C.execute('leftclick',[{x:mousePos.x, y: mousePos.y}])
			evt.stopPropagation();
			evt.preventDefault();
		}, false);
		self.canvas.addEventListener('contextmenu', function(evt) {
			var mousePos = getMousePos(self.canvas, evt);
			self.C.execute('rightclick',[{x:mousePos.x, y: mousePos.y}])
			evt.stopPropagation();
			evt.preventDefault();
		}, false);
		self.canvas.addEventListener('mousewheel', function(evt) {
			var mousePos = getMousePos(self.canvas, evt);
			self.C.execute('mousewheel',[{x:mousePos.x, y: mousePos.y},evt.wheelDelta])
			evt.stopPropagation();
			evt.preventDefault();
		}, false);

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