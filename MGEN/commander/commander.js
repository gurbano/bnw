var Commander = function (app) {
	var self = this;
	this.app = app;

	var lastZoneSelected = {debug:false};
	var commands ={
		'genera': function (args) {
			this.MF.generatePoints(args);
			return true;
		},
		'leftclick': function (point) {
			console.info(point);
			console.info(this.MF.getZone(point));
		},
		'rightclick': function (point) {
			console.info(point);
			this.R.resetZoom();
		},
		'mousewheel': function (point, delta) {
			this.R.zoom(delta>0);
		},
		'mousemove':function (point) {			
			var zone = this.MF.getZone(point);
			lastZoneSelected.debug = false;
			zone.debug=true;
			lastZoneSelected = zone;

		}
	}
	

	this.execute = function (command, args) {
		if (commands[command]){
			return commands[command].bind(self.app)(...args);
		}else{
			console.error(command,'non implementato', args)
		}
	}
}

module.exports = Commander;