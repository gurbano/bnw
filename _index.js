var genId = function () {return Math.floor(Math.random() * 20000000000);;}
var BaseEntity = function BaseEntity(tipo, options) {
	this.id = options.id || genId();
	this.pos = options.pos;
	this.tipo = tipo;
	this.behaviours = [

	]
	return this;
}
var BEHAVE = {
	DEFAULT : function (ID) {
		return [];
	},
	GET: function (ID,options) {
		return {};
	},

}




var Blueprint = {
	E: function (status, base) {
		var ret = base || new BaseEntity('E',status);
		return ret;
	},
	PG: function (status, base) {
		var ret = base || new BaseEntity('PG',status);
		ret.behaviours.concat(BEHAVE.DEFAULT('PG'))
		ret.behaviours.push(BEHAVE.GET('CONTROLLED',{}))
		return ret;
	},
	PNG: function (options, base) {
		var ret = base || new BaseEntity('PNG',status);
		ret.behaviours.concat(BEHAVE.DEFAULT('PNG'))
		return ret;
	},
	GOBLIN: function (options, base) {
		var ret = base || new BaseEntity('GOBLIN',status);
		ret.behaviours.concat(BEHAVE.DEFAULT('GOBLIN'))
		return ret;
	},
	BUILDING: function (options, base) {
		var ret = base || new BaseEntity('BUILDING',status);
		ret.behaviours.concat(BEHAVE.DEFAULT('BUILDING'))
		return ret;
	},

}



var store = {
	entities: [{
		id: 000001,
		status:{			
			pos:{x:0, y:0},	
		},
		blueprint: 'E|PG', 
	},{
		id: 000002,
		status:{			
			pos:{x:20, y:10},
			stats:{
				FOR: 13,
				DEX: 9,
				INT: 4
			}			
			behaviours: [
				{ID:'SCARED', data:{by:001}},
				{ID:'RUNNING', data:{from:001}},
			]
		},
		blueprint: 'E|PNG|GOBLIN', 
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