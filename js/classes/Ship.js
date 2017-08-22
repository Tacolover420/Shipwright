define(['util'],
function(util ) {
  /* Static */
  var WAKE_LIMIT = 14;
  var MAX_VELOCITY = 0.205776; // 8 knots should be 0.0205776 tiles/s if 1 tile = 10m, but too slow, so doing 1tile=100m
  
  /* Public */
  return function Ship(type, name) {
    var skin;

    /* Properties */
    this.name = name;
    this.type = 'caravel';
    this.rudder = 0;
    this.rudderCooldown = 0;
    var anchor = false;
    var anchorCooldown = 0;
    this.sails = 0;
    this.velocity = 0;
    this.position = {
      heading: 0, // Degrees
      x: 0,
      y: 0
    }
    this.hulk = 1;
    this.acceleration = 0.1;
    this.health = 100;
    this.ai = false; // Whether ship should be controlled by ai
    var wake = []; // Array of last 10 locations to draw wakes at
    var wakeCooldown = 0;
    var length = 2; //0.083*30; // Length of full image, not just the ship itself
    var width = 1; //0.042*30; // Ships are draw at 30x scale

    /* Methods */
    this.setType = function (newType) {
      var json;
      // Load json
      $.ajax({
        type: 'GET',
        url: 'images/'+newType+'.json',
        dataType: 'json',
        success: function(data) {
          json = data;
        },
        async: false
      });
      skin = {
        url: 'images/'+newType+'.png',
        layers: json.meta.layers,
        layerHeight: json.meta.size.h,
        layerWidth: json.meta.size.w
      };
      type = newType;
    };
    this.setType(type);
    this.getType = function () {
      return type;
    };
    this.adjustRudder = function (degrees) {
      this.rudder += degrees;
      if (this.rudder < -60) this.rudder = -60;
      if (this.rudder > 60) this.rudder  = 60;
      this.rudderCooldown = 5;
    };
    this.adjustSails = function (percent) {
      this.sails += percent;
      if (this.sails < 0) this.sails = 0;
      if (this.sails > 1) this.sails = 1;
    };
    this.toggleAnchor = function () {
      if (anchorCooldown <= 0) {
        anchor = !anchor;
        //this.anchorCooldown = 60;
      }
    };

    /* Inheritied */
    this.tick = function (delta) {
      this.velocity += this.acceleration * (this.sails-0.1) / 5 * delta;
      if (anchor) this.velocity -= 0.05;
      if (this.velocity > MAX_VELOCITY*this.sails) this.velocity = MAX_VELOCITY*this.sails;
      if (this.velocity < 0) this.velocity = 0;

      var prevX = this.position.x;
      var prevY = this.position.y;
      this.position.x += this.velocity * Math.cos(Math.PI / 180 * this.position.heading) / 5 * delta;
      if (this._world.isOccupied(this.position.x, this.position.y))
        this.position.x = prevX;
      this.position.y += this.velocity * Math.sin(Math.PI / 180 * this.position.heading) / 5 * delta;
      if (this._world.isOccupied(this.position.x, this.position.y))
        this.position.y = prevY;

      this.position.heading += this.rudder / 30 * (this.velocity / MAX_VELOCITY / 2 + (MAX_VELOCITY/2)) * delta;
      if (this.position.heading > 360) this.position.heading -= 360;
      if (this.position.heading < 0) this.position.heading += 360;

      // Move rudder back to center
      if (this.rudderCooldown <= 0) {
        if (this.rudder >= 3) this.rudder -= 3;
        if (this.rudder <= -3) this.rudder += 3;
        if (this.rudder < 3 && this.rudder > -3) this.rudder = 0;
      } else this.rudderCooldown -= delta;

      // Update wake
      if (wakeCooldown <= 0) {
        wake.push({
          x: this.position.x,
          y: this.position.y,
          h: this.position.heading
        });
        if (wake.length > 10)
          wake = wake.slice(-10);
        wakeCooldown = 10;
      } else wakeCooldown -= delta;

      anchorCooldown -= delta;
    };

    this.draw = function (ui) {
      // Draw wake
      for (var w = 0; w < wake.length; w++)
        ui.drawImageRel(wake[w].x-(length/2),wake[w].y-(width/2),length,width,'images/caravel_wake.png',wake[w].h,w/10+wakeCooldown/100);

      // Draw ship
      for (var l = 0; l < skin.layers.length; l++) {
        ui.drawSpriteRel(
          this.position.x - length/2,
          this.position.y - width/2 - l/skin.layerHeight,
          length,
          width,
          0,
          l*skin.layerHeight,
          skin.layerWidth,
          skin.layerHeight,
          skin.url,
          this.position.heading,
          skin.layers[l].opacity / 255
        );
      }
      //ui.drawRectRel(this.position.x-1,this.position.y-0.5,2,1,'#7a5738');
      //ui.drawImageRel(this.position.x-(length/2),this.position.y-(width/2),length,width,'images/'+this.type+'.png',this.position.heading);
      ui.drawTextRel(this.position.x,this.position.y+1,this.name?this.name:util.capitalize(type),0.3,'#000',true);
      

      // Debug
      if (DEBUG) ui.drawRectRel(this.position.x-0.05,this.position.y-0.05,0.1,0.1,'red');
    };
  }; // End public declarations
});