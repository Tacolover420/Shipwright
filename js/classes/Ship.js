define([''],
function() {
  /* Static */
  var WAKE_LIMIT = 14;
  var MAX_VELOCITY = 0.205776; // 8 knots should be 0.0205776 tiles/s if 1 tile = 10m, but too slow, so doing 1tile=100m
  
  /* Public */
  return function Ship(name) {
    /* Properties */
    this.name = name;
    if (!this.name) this.name = 'Caravel';
    this.type = 'caravel';
    this.rudder = 0;
    this.rudderCooldown = 0;
    this.anchor = false;
    this.anchorCooldown = 0;
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
    this.wake = []; // Array of last 10 locations to draw wakes at
    this.wakeCooldown = 0;
    this.length = 0.083*30; // Length of full image, not just the ship itself
    this.width = 0.042*30; // Ships are draw at 30x scale

    /* Methods */
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
      if (this.anchorCooldown <= 0) {
        this.anchor = !this.anchor;
        //this.anchorCooldown = 60;
      }
    };

    /* Inheritied */
    this.tick = function (delta) {
      this.velocity += this.acceleration * (this.sails-0.1) / 5 * delta;
      if (this.anchor) this.velocity -= 0.05;
      if (this.velocity > MAX_VELOCITY) this.velocity = MAX_VELOCITY;
      if (this.velocity < 0) this.velocity = 0;

      var prevX = this.position.x;
      var prevY = this.position.y;
      this.position.x += this.velocity * Math.cos(Math.PI / 180 * this.position.heading) / 5 * delta;
      if (!this._world.checkInBounds(this.position.x, this.position.y) || this._world.getTileAt(this.position.x,this.position.y).collidable)
        this.position.x = prevX;
      this.position.y += this.velocity * Math.sin(Math.PI / 180 * this.position.heading) / 5 * delta;
      if (!this._world.checkInBounds(this.position.x, this.position.y) || this._world.getTileAt(this.position.x,this.position.y).collidable)
        this.position.y = prevY;

      this.position.heading += this.rudder / 50 * (this.velocity / MAX_VELOCITY / 2 + (MAX_VELOCITY/2)) * delta;
      if (this.position.heading > 360) this.position.heading -= 360;
      if (this.position.heading < 0) this.position.heading += 360;

      // Move rudder back to center
      if (this.rudderCooldown <= 0) {
        if (this.rudder >= 3) this.rudder -= 3;
        if (this.rudder <= -3) this.rudder += 3;
        if (this.rudder < 3 && this.rudder > -3) this.rudder = 0;
      } else this.rudderCooldown -= delta;

      // Update wake
      if (this.wakeCooldown <= 0) {
        this.wake.push({
          x: this.position.x,
          y: this.position.y,
          h: this.position.heading
        });
        if (this.wake.length > 10)
          this.wake = this.wake.slice(-10);
        this.wakeCooldown = 10;
      } else this.wakeCooldown -= delta;

      this.anchorCooldown -= delta;
    };

    this.draw = function (ui) {
      // Draw wake
      for (var w = 0; w < this.wake.length; w++)
        ui.drawImageRel(this.wake[w].x-(this.length/2),this.wake[w].y-(this.width/2),this.length,this.width,'images/'+this.type+'_wake.png',this.wake[w].h,w/10+this.wakeCooldown/100);

      // Draw ship
      //ui.drawRectRel(this.position.x-1,this.position.y-0.5,2,1,'#7a5738');
      ui.drawImageRel(this.position.x-(this.length/2),this.position.y-(this.width/2),this.length,this.width,'images/'+this.type+'.png',this.position.heading);
      ui.drawTextRel(this.position.x,this.position.y+1,this.name,0.3,'#000',true);

      // Debug
      ui.drawRectRel(this.position.x-0.05,this.position.y-0.05,0.1,0.1,'red');
    };
  }; // End public declarations
});