define(['jquery', 'util'],
function($      ,  util ) {
	/* Private */
	var canvases = {};
	var context;
	var buffer;
	var scale;
	var xOffset = 0;
	var yOffset = 0;
	var fpsBody;
	var imageCache = {};
	var width;
	var height;
	var viewPort = {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		tileScale: 64 // 100 meters = 1 tile = 64 pixels
	};

	/* Public */
	public = {
		init: function () {
			canvases.active = $('#game');
			canvases.buffer = $('#buffer');
			context = canvases.active[0].getContext('2d');
			buffer = canvases.buffer[0].getContext('2d');
			inventory = $('#inventoryBody');
			fpsBody = $('#fpsBody');

			viewPort.width = canvases.active.width();
			viewPort.height = canvases.active.height();

			buffer.imageSmoothingEnabled = false;
			
			// Preload common images
			var images = [
				'images/caravel_wake.png'
			];
			for (var i of images) {
				imageCache[i] = new Image();
				imageCache[i].src = i;
			}
		},

		getWidth: function () {
			if (!width) width = $('#game').width()
			return width;
		},

		getHeight: function () {
			if (!height) height = $('#game').height()
			return height;
		},

		getViewPort: function () {
			return viewPort;
		},

		centerViewPort: function (x, y, world) {
			x *= viewPort.tileScale;
			y *= viewPort.tileScale;
			viewPort.x = x - (viewPort.width / 2);
			viewPort.y = y - (viewPort.height / 2);
			// Side cases
			if (viewPort.x < 0)
				viewPort.x = 0;
			if (viewPort.y < 0)
				viewPort.y = 0;
			if (viewPort.x + viewPort.width > world.width * viewPort.tileScale)
				viewPort.x = world.width * viewPort.tileScale - viewPort.width;
			if (viewPort.y + viewPort.height > world.height * viewPort.tileScale)
				viewPort.y = world.height * viewPort.tileScale - viewPort.height;
		},

		isOnScreen: function (x, y, width, height) {
			x *= viewPort.tileScale;
			y *= viewPort.tileScale;
			width *= viewPort.tileScale;
			height *= viewPort.tileScale;
			return x - Math.abs(xOffset) < (viewPort.x + viewPort.width)
					&& y - Math.abs(yOffset) < (viewPort.y + viewPort.height)
					&& x + xOffset + width > viewPort.x
					&& y + yOffset + height > viewPort.y
		},

		getVisibleTileArea: function () {
			area = {
				minX: Math.floor((viewPort.x + xOffset) / viewPort.tileScale) - 1,
				minY: Math.floor((viewPort.y + yOffset) / viewPort.tileScale) - 1
			};
			if (area.minX < 0) area.minX = 0;
			if (area.minY < 0) area.minY = 0;
			area.maxX = area.minX + Math.ceil(viewPort.width / viewPort.tileScale) + 2;
			area.maxY = area.minY + Math.ceil(viewPort.height / viewPort.tileScale) + 2;
			return area;
		},

		setOffset: function (x, y) {
			xOffset = x;
			yOffset = y;
		},

		setAA: function (newValue) {
			buffer.imageSmoothingEnabled = newValue;
		},

		drawRect: function(x, y, width, height, color) {
			buffer.beginPath();
			buffer.fillStyle = color;
			// Start with x,y on original canvas
			// Translate by the viewPort x,y
			// Scale to fill viewPort
			buffer.rect(x, y, width, height);
			buffer.fill();
			buffer.closePath();
		},

		drawRectRel: function (x, y, width, height, color) {
			if (!public.isOnScreen(x,y,width, height)) return;
			x *= viewPort.tileScale;
			y *= viewPort.tileScale;
			width *= viewPort.tileScale;
			height *= viewPort.tileScale;
			buffer.beginPath();
			buffer.fillStyle = color;
			// Start with x,y on original canvas
			// Translate by the viewPort x,y
			// Scale to fill viewPort
			buffer.rect(
					(x + xOffset - viewPort.x),
					(y + yOffset - viewPort.y),
					width,
					height);
			buffer.fill();
			buffer.closePath();
		},

		// Takes tileset coords
		drawImageRel: function(x, y, width, height, url, degrees = 0, opacity = 1) {
			public.drawSpriteRel(x, y, width, height, 0, 0, 0, 0, url, degrees, opacity);
		},

		drawSprite: function(x, y, width, height, dx, dy, dwidth, dheight, url, degrees = 0, opacity = 1) {
			if (!imageCache[url]) {
				console.log('Loaded ' + url);
        imageCache[url] = new Image();
        imageCache[url].src = url;
			}
			buffer.globalAlpha = opacity;
			if (dwidth == 0 && dheight == 0)
				buffer.drawImage(imageCache[url], x, y, width, height);
			else
				buffer.drawImage(imageCache[url], dx, dy, dwidth, dheight, x, y, width, height);
			buffer.globalAlpha = 1;
		},

		drawSpriteRel: function(x, y, width, height, dx, dy, dwidth, dheight, url, degrees = 0, opacity = 1) {
			if (!public.isOnScreen(x, y, width, height)) return;
			x *= viewPort.tileScale;
			y *= viewPort.tileScale;
			width *= viewPort.tileScale;
			height *= viewPort.tileScale;
			//buffer.scale(viewPort.tileScale, viewPort.tileScale);
      if (!imageCache[url]) {
				console.log('Loaded ' + url);
        imageCache[url] = new Image();
        imageCache[url].src = url;
			}
			buffer.globalAlpha = opacity;
			if (degrees != 0) {
				buffer.save();
				buffer.translate(x + (width/2) + xOffset - viewPort.x, y + (height/2) + yOffset - viewPort.y);
				buffer.rotate(Math.PI/180*degrees);
				if (dwidth == 0 && dheight == 0)
					buffer.drawImage(imageCache[url],
						-width/2,
						-height/2,
						width,
						height
					);
				else
					buffer.drawImage(imageCache[url],
						dx,
						dy,
						dwidth,
						dheight,
						-width/2,
						-height/2,
						width,
						height
					);
				buffer.restore();
			} else {
				if (dwidth == 0 && dheight == 0)
					buffer.drawImage(imageCache[url],
						(x + xOffset - viewPort.x),
						(y + yOffset - viewPort.y),
						width,
						height
					);
				else
					buffer.drawImage(imageCache[url],
						dx,
						dy,
						dwidth,
						dheight,
						(x + xOffset - viewPort.x),
						(y + yOffset - viewPort.y),
						width,
						height
					);
			}
			//buffer.scale(1/viewPort.tileScale,1/viewPort.tileScale);
			//buffer.setTransform(1,0,0,1,0,0); // Reset transformation matrix to identity
			buffer.globalAlpha = 1;
		},

		drawText: function (x, y, text, fontSize, color, centered = false, fontName = 'Courier New') {
			if (DEBUG) public.drawRect(x, y, 5, 5, 'red');
			buffer.beginPath();
			buffer.fillStyle = color;
			buffer.textAlign = centered ? 'center' : 'left';
			buffer.font = fontSize + 'px ' + fontName;
			buffer.fillText(text, x, y);
			buffer.closePath();
		},

		drawTextRel: function (x, y, text, fontSize, color, centered = false) {
			x *= viewPort.tileScale;
			y *= viewPort.tileScale;
			if (   x > (viewPort.x + viewPort.width)
					|| y > (viewPort.y + viewPort.height)
					|| x < viewPort.x
					|| y < viewPort.y) return; // Check if off-screen before drawing
			buffer.beginPath();
			buffer.fillStyle = color;
			buffer.textAlign = centered ? 'center' : 'left';
			buffer.font = Math.floor(fontSize * viewPort.tileScale) + 'px Courier New';
			buffer.fillText(text,
				x + xOffset - viewPort.x,
				y + yOffset - viewPort.y);
			buffer.closePath();
		},

		drawBuffer: function () {
			context.drawImage(canvases.buffer[0],0,0);
		},

		updateTimes: function (debugStats, world) {
			var tableBody = '';
			var ec = world.getEntityCount();
			var player = world.getPlayer();
			tableBody += '<tr><th colspan=2>Debug Information</th></tr>';
			tableBody += '<tr><td>TPS</td><td>'+debugStats.getTPS().toFixed(0)+' fps</td></tr>';
			tableBody += '<tr><td>Delta</td><td>'+debugStats.getDelta()+'</td></tr>';
			tableBody += '<tr><td>Tick</td><td>'+debugStats.lastTwentyTickTimes[0]+' ms</td></tr>';
			tableBody += '<tr><td>Draw</td><td>'+debugStats.lastTwentyDrawTimes[0]+' ms</td></tr>';
			tableBody += '<tr><td>Entities</td><td>'+ec.current+'/'+ec.max+'</td></tr>';
			tableBody += '<tr><td>Wind</td><td>0 knots at NNE</td></tr>';
			if (player) {
				tableBody += '<tr><td>X</td><td>'+Math.floor(player.position.x)+'</td></tr>';
				tableBody += '<tr><td>Y</td><td>'+Math.floor(player.position.y)+'</td></tr>';
				tableBody += '<tr><td>Rudder</td><td>'+player.rudder+'/60 deg</td></tr>';
				tableBody += '<tr><td>Sails</td><td>'+Math.floor(player.sails*100)+'/100%</td></tr>';
				tableBody += '<tr><td>Heading</td><td>'+util.degreesToCardinal(player.position.heading)+'</td></tr>';
				tableBody += '<tr><td>Velocity</td><td>'+Math.floor(player.velocity/0.025722*100)/100+' knots</td></tr>';
				tableBody += '<tr><td>Anchor</td><td>'+(player.anchor?'dropped':'weighed')+'</td></tr>';
			}
			if (fpsBody.html() !== tableBody) fpsBody.html(tableBody);
		}
	}
	return public; // End public declarations
});