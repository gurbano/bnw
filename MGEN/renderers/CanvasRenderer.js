var Renderer = function (opts) {
	var canvas = document.getElementById(opts.canvas);
	canvas.width  = opts.width; // in pixels
	canvas.height = opts.height; // in pixels

	var drawBack = function (ctx) {		
		ctx.beginPath();
		ctx.rect(0,0,canvas.width,canvas.height);
		ctx.fillStyle = 'white';
		ctx.fill();
		ctx.strokeStyle = '#888';
		ctx.stroke();
	}
	var drawSites = function (ctx, sites) {
		ctx.beginPath();
		ctx.fillStyle = '#44f';
		var iSite = sites.length;
		while (iSite--) {
			v = sites[iSite];
			ctx.rect(v.x-2/3,v.y-2/3,2,2);
		}
		ctx.fill();
	}
	var drawVertex = function (ctx, sites) {
		ctx.beginPath();
		ctx.fillStyle = '#f00';
		var iSite = sites.length;
		while (iSite--) {
			v = sites[iSite];
			ctx.rect(v.x-2/3,v.y-2/3,2,2);
		}
		ctx.fill();
	}
	var drawEdges = function (ctx, edges) {
		ctx.beginPath();
		ctx.strokeStyle = '#000';
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

		ctx.beginPath();
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
		ctx.beginPath();
		ctx.fillStyle = '#f00';
		let v = zone.point;
		ctx.rect(v.x-2/3,v.y-2/3,2,2);
		ctx.fill();
	}

	var drawZoneName = function(ctx, zone){
		if (zone.water){
			ctx.fillStyle = '#fff';
		}else{
			ctx.fillStyle = '#fff';
		}
		ctx.font="13px Verdana";
		ctx.fillText(zone.tipo+' '+zone.id, zone.point.x - 13,zone.point.y +10);
		if (zone.water){
			ctx.font="10px Verdana";
			ctx.fillText('water', zone.point.x - 13,zone.point.y +20);	
		}		
		//ctx.fill();
	}
	var drawZoneColor = function (ctx, zone) {
		//console.log(zone);	
		//var points = zone.corners.map(function (c) {return c.point;})
		var points = zone.borders.reduce(function (acc, border) {return acc.concat([border.v0.point].concat([border.v1.point]))},[])


		var isTheSame = function (p1,p2) {
			return (p1.x==p2.x && p1.y==p2.y);
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
				border = nextBorder(border, zone.borders);
				if (border){
					points.push(border.v1.point);	
				}else{
					console.log('nessun next border')
					break;
				}				
			}else{
				console.log('nessun next border')
				break;
			}
		}
		

		



		ctx.fillStyle = zone.water ? '#44f' : '#4fg';
		ctx.beginPath();
		ctx.moveTo(points[0].x,points[0].y)
		points.map(function (p) {
			ctx.lineTo(p.x, p.y);
		})
		ctx.lineTo(points[0].x,points[0].y)
		ctx.closePath();
		ctx.fill();
	}

	var drawZones = function (ctx, zones) {
		
		Object.keys(zones).map(function(key){
			var zone = zones[key];
			//console.log(zone)
			drawZoneCenter(ctx,zone);
			drawZoneColor(ctx,zone);
			drawZoneName(ctx,zone);			
		})
		/*ctx.beginPath();
		ctx.strokeStyle = '#0FF';
		ctx.moveTo(v0.x,v0.y);
		ctx.lineTo(v1.x,v1.y);
		ctx.stroke();		
		*/
	}


	this.render = function (map) {	
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.globalAlpha = 1;
		drawBack(ctx);
		/*if (map && map.sites){
			drawSites(ctx, map.sites);			
		}*/
		if (map && map.edges){
			drawEdges(ctx, map.edges)
		}
		/*
		if (map && map.graph  && map.graph.borderMap){
			drawBorders(ctx,map.graph.borderMap);
		}
		*/
		if (map && map.graph && map.graph.zonesMap){
			drawZones(ctx,map.graph.zonesMap);
		}

	}
}
module.exports = Renderer;