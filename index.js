var genId = function () {return Math.floor(Math.random() * 20000000000);;}
var BaseEntity = function BaseEntity(tipo, options) {
	this.id = options.id || genId();
	this.pos = options.pos;
	this.tipo = tipo;
	this.behaviours = [

	]
	return this;
}
var BEHAVE = function (ID) {return {}}
var Blueprint = {
	PG: function (options) {
		var ret = new BaseEntity('PG',options);
		//ret.behaviours.push(BEHAVE.DEFAULT('PG'))
		ret.behaviours.push(BEHAVE('CONTROLLED'))
		return ret;
	},
	PNG: function (options) {
		var ret = new BaseEntity('PNG',options);
		ret.behaviours.push(BEHAVE('PNG'));
		return ret;
	},
}



var store = {
	entities: [{
		id: 000001,
		status:{			
			pos:{x:0, y:0},	
		},		
		tipo: 'PG', 
	}],
	avatars: []

}


var App = function App() {
	var self = this;
	var R = undefined; //Renderer
	var S = undefined; //Simulatore
	this.ready = false;
	this.init = function () {
		//inizializza il renderer
		//inizializza il simulatore
		self.ready = true;
	}
}

var app = new App();
app.start();