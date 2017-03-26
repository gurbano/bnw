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

	var drawZones = function (ctx, zones) {

		ctx.beginPath();
		ctx.strokeStyle = '#0FF';

		Object.keys(zones).map(function(zone){
			return(zones[zone].water);
		})
		ctx.stroke();		
	}


	this.render = function (map) {	
		var ctx = canvas.getContext('2d');
		ctx.globalAlpha = 1;
		drawBack(ctx);
		if (map && map.sites){
			//drawSites(ctx, map.sites);
			drawVertex(ctx, map.sites);
		}
		if (map && map.edges){
			drawEdges(ctx, map.edges)
		}
		if (map && map.graph){
			drawBorders(ctx,map.graph.borderMap);
		}
		if (map && map.zones){
			drawZones(ctx,map.zones);
		}

	}
}
module.exports = Renderer;