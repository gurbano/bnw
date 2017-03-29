
var Renderer = function (opts) {
	var canvas = document.getElementById(opts.canvas);
	canvas.width  = opts.width; // in pixels
	canvas.height = opts.height; // in pixels

	var resetCtx = function (ctx) {
		ctx.beginPath();
		ctx.fillStyle = 'black';
		ctx.strokeStyle = '#767';
		ctx.lineWidth=1;
	}

	var drawBack = function (ctx) {		
		ctx.beginPath();
		ctx.rect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = 'black';
		ctx.fill();
		ctx.strokeStyle = '#767';
		ctx.stroke();
	}
	var drawSites = function (ctx, sites) {
		resetCtx(ctx);
		ctx.fillStyle = '#44f';
		var iSite = sites.length;
		while (iSite--) {
			v = sites[iSite];
			ctx.rect(v.x-2/3,v.y-2/3,2,2);
		}
		ctx.fill();
	}
	var drawVertex = function (ctx, sites) {
		resetCtx(ctx);
		ctx.fillStyle = '#f00';
		var iSite = sites.length;
		while (iSite--) {
			v = sites[iSite];
			ctx.rect(v.x-2/3,v.y-2/3,2,2);
		}
		ctx.fill();
	}
	var drawEdges = function (ctx, edges) {
		resetCtx(ctx);
		ctx.strokeStyle = '#888';
		var	iEdge = edges.length,
			edge, v;
		while (iEdge--) {
			edge = edges[iEdge];
			v = edge.va;
			ctx.moveTo(v.x,v.y);
			v = edge.vb;
			ctx.lineTo(v.x,v.y);
			}
		ctx.stroke();
		// body...
	}
	var drawBorders = function (ctx, borderMap) {

		resetCtx(ctx);
		ctx.strokeStyle = '#0FF';

		Object.keys(borderMap).map(function(key){
			var border = borderMap[key];
			var v0 = border.vertices[0];
			var v1 = border.vertices[1];
			ctx.moveTo(v0.x,v0.y);
			ctx.lineTo(v1.x,v1.y);
		})
		ctx.stroke();		
	}



	/*ZONES*/

	var drawZoneCenter = function (ctx, zone) {
		resetCtx(ctx);
		//if (!zone.debug){return}
		ctx.fillStyle = '#000';
		let v = zone.point;
		ctx.rect(v.x-2,v.y-2,2,2);
		ctx.fill();
		
	}

	var drawZoneName = function(ctx, zone){
		resetCtx(ctx);
		if (!zone.debug){return}
		if (zone.water){
			ctx.fillStyle = '#fff';
		}else{
			ctx.fillStyle = '#fff';
		}
		ctx.font="12px Arial";
		
		
		var x = parseInt(zone.point.x) - 10;
		var y = parseInt(zone.point.y) + 15;
		ctx.fillText('z'+zone.id, x,y );
		//ctx.fill();
		/*if (zone.water){
			ctx.font="10px Verdana";
			ctx.fillText('water', zone.point.x - 13,zone.point.y +20);	
		}*/		
		resetCtx(ctx);
	}
	var drawZoneColor = function (ctx, zone) {
		//console.log(zone);	
		//var points = zone.corners.map(function (c) {return c.point;})
		var points = zone.borders.reduce(function (acc, border) {return acc.concat([border.v0.point].concat([border.v1.point]))},[])


		var isTheSame = function (p1,p2) {
			return (parseFloat(p1.x).toFixed(2)==parseFloat(p2.x).toFixed(2) && parseFloat(p1.y).toFixed(2)==parseFloat(p2.y).toFixed(2));
		}
		var nextBorder = function (b, borders) {
			for (var i = 0; i < borders.length; i++) {
				var border = borders[i];
				if (isTheSame(b.v1.point, border.v0.point) && (!isTheSame(b.v0.point, border.v1.point))){
					//console.log('trovato')
					return border;
				}
				if (isTheSame(b.v1.point, border.v1.point) && (!isTheSame(b.v0.point, border.v0.point))){
					let vt = border.v1;
					border.v1 = border.v0;
					border.v0 = vt;
					return border;
				}
			}
			return null;			
		}

		var points = [];
		var border = zone.borders[0];
		points.push(border.v0.point);
		points.push(border.v1.point);
		for (var i = 1; i < zone.borders.length; i++) {
			if (border){
				var old_border = border;
				border = nextBorder(border, zone.borders);
				if (border){
					points.push(border.v1.point);	
				}else{
					console.table(points)
					console.log('nessun next border')
					console.table(border)					
					console.table(zone.borders)
					break;
				}				
			}else{
				console.log('nessun next border')
				
				//break;
			}
		}
		resetCtx(ctx);
		ctx.lineWidth=0.1
		var colors= {
			'ocean': 'rgba(120,120,255,0.7)',
			'water': 'rgba(30,70,210,0.7)',
			'land': 'rgba(60,255,60,0.7)',
			'black': 'rgba(0,0,0,1)'
		}
		var getColor = function(z){
			if (z.ocean) return colors['ocean'];
			if (z.water) return colors['water'];
			return colors['land'];

		}
		ctx.strokeStyle = getColor(zone);
		ctx.fillStyle = getColor(zone);
		ctx.moveTo(points[0].x,points[0].y)
		points.map(function (p) {
			ctx.lineTo(p.x, p.y);
		})
		ctx.lineTo(points[0].x,points[0].y)
			
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
	}

	var drawZones = function (camera, ctx, zones) {
		
		Object.keys(zones).map(function(key){
			var zone = zones[key];
			drawZoneColor(ctx,zone);			
		})
		Object.keys(zones).map(function(key){
			var zone = zones[key];	
			drawZoneCenter(ctx,zone);			
			drawZoneName(ctx,zone);			
		})
		
	}

	var _z= 1;
	var view = {		
		zoom: _z,
		center: {
			x: canvas.width/2,
			y: canvas.height/2
		}
	}

	this.resetZoom = function () {
		view.zoom = 1/_z;
		_z=1;
	}
	this.zoom = function (zoomIn) {
		if(zoomIn){
			view.zoom = 1.1;
			_z = _z*1.1;			
		}else{
			view.zoom = 0.9;
			_z = _z*0.9;
		}
		console.log('zoom level',_z )
	}

	var xView =0;
	var yView =0;

	this.render = function (map) {	
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;
		/*START DRAWING*/
		drawBack(ctx);		
		if (map && map.graph && map.graph.zonesMap){
			drawZones(view,ctx,map.graph.zonesMap);
		}
		ctx.scale(view.zoom,view.zoom)
		view.zoom = 1;
		this.image = new Image();
		this.image.src = ctx.canvas.toDataURL("image/png");	
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(this.image, 0, 0, this.image.width*view.zoom, this.image.height*view.zoom, -xView*view.zoom, -yView*view.zoom, this.image.width*view.zoom, this.image.height*view.zoom);
	}
}
module.exports = Renderer;