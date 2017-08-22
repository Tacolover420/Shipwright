define([''],
function() {
  var background = [];
  var foreground = [];
  var collision = [];
  var tileKey = [];
  var spawns = [];

  return function TiledMap(jsonUrl) {
    var json;

    // Load json
    $.ajax({
      type: 'GET',
      url: jsonUrl,
      dataType: 'json',
      success: function(data) {
        json = data;
      },
      async: false
    });

    // Parse layers
    var parsingBackground = true;
    for (var l = 0; l < json.layers.length; l++) {
      var layer = json.layers[l];
      if (layer.name == 'entities' && layer.type == 'objectgroup') {
        parsingBackground = false;
        continue;
      }
      if (layer.name == 'spawns' && layer.type == 'objectgroup') {
        spawns = layer.objects;
        for (var s = 0; s < spawns.length; s++) {
          spawns[s] = {
            x: (spawns[s].x/json.tilewidth) + (spawns[s].width/2/json.tilewidth),
            y: (spawns[s].y/json.tileheight) + (spawns[s].height/2/json.tileheight),
            dir: spawns[s].rotation
          };
        }
      }
      if (layer.name == 'collision' && layer.type == 'tilelayer') {
        collision = new Array(layer.data.length);
        for (var d = 0; d < layer.data.length; d++)
          collision[d] = layer.data[d] != 0;
        continue;
      }
      if (layer.type == 'tilelayer') {
        if (parsingBackground) background.push(layer);
        else foreground.push(layer);
      }
    }

    // Construct tile key (tile ids -> tile image coordinates, url, and terrain)
    for (var ts = 0; ts < json.tilesets.length; ts++) {
      var tileset = json.tilesets[ts];
      for (var id = tileset.firstgid; id < tileset.firstgid + tileset.tilecount; id++)
        tileKey[id] = {
          x: (id - tileset.firstgid) % (tileset.imagewidth / tileset.tilewidth) * tileset.tilewidth,
          y: Math.floor((id - tileset.firstgid) / (tileset.imagewidth / tileset.tilewidth)) * tileset.tileheight,
          width: tileset.tilewidth,
          height: tileset.tileheight,
          url: 'images/' + tileset.image,
          properties: tileset.tileproperties[id - tileset.firstgid],
          terrain: null // TODO Calculate  the terrain type
        };
    }

    // Private functions
    function drawLayer(ui, layer) {
      var vArea = ui.getVisibleTileArea();
      for (var l = 0; l < background.length; l++) {
        var layer = background[l];
        if (!layer.visible) continue;
        // TODO Use visible tile area to lessen loop iterations
        for (var i = 0; i < layer.data.length; i++) {
          if (layer.data[i] == 0) continue;
          var tileImg = tileKey[layer.data[i]];
          // TODO Check if tile is animated
          ui.drawSpriteRel(
            i % json.width,
            Math.floor(i / json.width),
            1,
            1,
            tileImg.x,
            tileImg.y,
            tileImg.width,
            tileImg.height,
            tileImg.url,
            0,
            layer.opacity
          );
        }
      }
    }

    // Properties
    this.getWidth = function() {
      return json.width;
    };
    this.getHeight = function() {
      return json.height;
    };
    this.getBackgroundColor = function() {
      return json.backgroundcolor;
    };

    // Public Methods
    this.isCollidable = function(x, y) {
      return collision[Math.floor(y*json.width + x)];
    };
    this.getSpawnPoint = function() {
      return spawns[Math.floor(Math.random()*spawns.length)];
    };
    this.getTileAt = function(x, y) {
      // Find topmost tile that's not collision and return its key
      var groups = [foreground, background];
      for (var lg = 0; lg < groups.length; lg++) {
        for (var l = groups[lg].length - 1; l >= 0; l--) {
          if (groups[lg][l].data[Math.floor(y*json.width + x)] != 0) {
            return tileKey[groups[lg][l].data[Math.floor(y*json.width + x)]];
          }
        }
      }
    };
    this.drawBG = function(ui) {
      ui.drawRect(0, 0, ui.getWidth(), ui.getHeight(), json.backgroundcolor);
      for (var l = 0; l < background.length; l++) {
        if (!background[l].visible) continue;
        drawLayer(ui, background[l]);
      }
    };
    this.drawFG = function(ui) {
      for (var l = 0; l < foreground.length; l++) {
        if (!foreground[l].visible) continue;
        drawLayer(ui, foreground[l]);
      }
    };
    this.drawLayer = function(ui, layerName) {
      // TODO Find layer by name
      drawLayer(ui, null);
    };
  };
});