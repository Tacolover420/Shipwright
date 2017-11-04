define(['interface', 'util', 'lib/lodash', 'classes/Ship', 'lib/perlin', 'moment', 'jquery'],
function(ui        ,  util ,  _          ,  Ship         ,  Perlin     ,  moment ,   $     ) {
  return function (width, height) {
    var public = this;

    /* Public Functions */
    this.getTileAt = function (x, y) {
      if (!this.checkInBounds(x, y)) return null;
      return tilemap[Math.floor(y)][Math.floor(x)];
    };
    this.getEntityCount = function () {
      return {
        current: this.entities.length,
        max: mobCap
      };
    }
    this.getPlayer = function () {
      return player;
    };
    this.addEntity = function (entity) {
      entity._world = this;
      this.entities.push(entity);
    };
    this.removeEntity = function (entity) {
      for (var i = 0; i < entities.length; i++) {
        if (entities[i] == entity) {
          this.entities.splice(i, 1);
          return;
        }
      }
    };
    this.queueInput = function (event) {
      inputQueue.push(event);
    };

    /* Main Game Loop Functions */
    this.input = function () {
      for (var e of inputQueue) {
        // TODO Track keyup and keydown myself so that the keys won't cancel each other
        if (e.type == 'click') {
          // Fire swivel cannon
        } else if (e.type == 'keydown') {
          switch (e.which) {
            case 37: // Rudder port
            case 65:
              player.adjustRudder(-5);
              break;
            case 38: // Unfurl sails
            case 87:
              player.adjustSails(0.01);
              break;
            case 39: // Rudder starboard
            case 68:
              player.adjustRudder(5);
              break;
            case 40: // Furl sails
            case 83:
              player.adjustSails(-0.01);
              break;
            case 82: // Drop/raise anchor
              player.toggleAnchor();
              break;
            default:
              console.log('Uncaptured key: ' + e.which);
              break;
          }
        } else if (e.type == 'mousemove') {
          // Turn swivel cannon
        }
      }
      inputQueue = [];
    }
    this.tick = function (delta) {
      var startTime = moment();

      // Tick world
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          if (!tilemap[y][x].discovered && ui.isOnScreen(x,y,1,1))
            tilemap[y][x].discovered = true;
        }
      }

      for (var e of this.entities)
        e.tick(delta);
      return moment() - startTime;
    };
    this.draw = function () {
      var startTime = moment();
      if (player) ui.centerViewPort(player.position.x, player.position.y, this);
      ui.drawRect(0,0,ui.getWidth(),ui.getHeight(),'#85afcc');

      // Draw world
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var tile = tilemap[y][x];
          var color = '#000';
          if (tile.type == 'water') continue;
          switch (tile.type) {
            case 'sand':
              color = '#ccbb85';
              break;
            case 'port':
              color = '#ff6600';
              break;
            case 'reef':
              color = '#549c98';
              break;
          }
          ui.drawRectRel(x,y,1,1,color);
        }
      }

      for (var e of this.entities)
        e.draw(ui);

      // Draw minimap
      ui.drawRect(ui.getWidth()-width*2, ui.getHeight()-height*2,width*2,height*2,'rgba(0,0,0,0.2)');
      for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
          var tile = tilemap[y][x];
          var color = '#000';
          switch (tile.type) {
            case 'water':
              color = '#546c98';
              break;
            case 'sand':
              color = '#ccbb85';
              break;
            case 'port':
              color = '#ff6600';
              break;
            case 'reef':
              color = '#549c98';
              break;
          }
          //if (!tile.discovered) color = '#777';
          ui.drawRect((ui.getWidth()-width*2) + (x*2), (ui.getHeight()-height*2) + (y*2), 2, 2, color);
        }
      }
      ui.drawRect((ui.getWidth()-width*2) + (player.position.x*2), (ui.getHeight()-height*2) + (player.position.y*2), 2, 2, 'red');
      ui.drawText(ui.getWidth()-width,ui.getHeight()-10, '10 x 5 km', 12, 'rgba(0,0,0,0.5)', true);
      ui.drawText(ui.getWidth()-width,ui.getHeight()-1, 'Ships drawn at x30 scale', 12, 'rgba(0,0,0,0.5)', true);

      ui.drawBuffer();
      return moment() - startTime;
    };
    this.checkInBounds = function (x, y) {
      return (x >= 0 && y >= 0 && Math.ceil(x) < width && Math.ceil(y) < height);
    };

    /* Constructor */
    var tilemap;
    this.entities = [];
    var inputQueue;
    var mobCap = 16;
    var player;
    this.generate = function () {
      // TODO Load from Tiled map
      tilemap = [];
      for (var y = 0; y < height; y++) {
        tilemap[y] = [];
        for (var x = 0; x < width; x++) {
          tilemap[y][x] = {
            collidable: false,
            type: 'water',
            discovered: false
          }
        }
      }
      var islandCount = 10;
      var islandSize = 8;
      var islandMultiplier = 1-Math.abs(Math.random()-Math.random());
      for (var i = 0; i < islandMultiplier * islandCount; i++) {
        var centerX = Math.random() * width;
        var centerY = Math.random() * height;
        if (centerX < 12 && centerY < 12) continue;
        for (var j = 0; j < islandSize*30; j++) {
          var tile = this.getTileAt(centerX+(Math.random()-Math.random())*islandSize, centerY+(Math.random()-Math.random())*islandSize);
          if (!tile) continue;
          if (tile.type == 'sand' && Math.random() < 0.1) {
            tile.type = 'port';
          } else if (tile.type == 'reef') {
            tile.type = 'sand';
            tile.collidable = true;
          } else {
            tile.type = 'reef';
          }
        }
      }

      // Actually draw stuff
      tilemap[0][0] = {
        collidable: true,
        type: 'sand',
        discovered: false
      };
    };
    this.reset = function () {
      tilemap = new Array(height);
      this.entities = [];
      // TODO Move tileScale into ui so that I won't have to keep multiplying everything by it in here
      /*tileScale = Math.floor( ui.getWidth() / width > ui.getHeight() / height 
          ? ui.getWidth() / width : ui.getHeight() / height);*/
      var vp = ui.getViewPort();
      /*ui.getViewPort().tileScale = Math.floor( ui.getWidth() / width > ui.getHeight() / height 
          ? ui.getWidth() / width : ui.getHeight() / height);*/
      inputQueue = [];
      player = new Ship('ha1fBit');
      player.position.x = 5;
      player.position.y = 5;
      this.addEntity(player);
      this.generate();
    }
    this.reset();
  }; // End public declarations
});