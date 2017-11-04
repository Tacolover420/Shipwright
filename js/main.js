requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min',
				moment: '//momentjs.com/downloads/moment',
				bootstrap: '../../../bootstrap/dist/js/bootstrap.min'
    },
		// Wait up to this amount; needed bc loading from URLs
		waitSeconds : 15,
		// Makes the following requireJS compatible by putting it in a wrapper
		shim: {
			bootstrap: {
				deps: ['jquery'],
				exports: 'bootstrap'
			}
		},
		// Configurations
		config: {
			moment: {
				noGlobal: true
			}
    }
});

var DEBUG = false;

// Start the main app logic.
requirejs(['jquery', 'bootstrap', 'moment', 'interface', 'classes/World'],
function  ( $      ,  bootstrap ,  moment ,  ui        ,  World         ) {

	var world;

	init();

	function init() {
		world = new World(100, 50); // 10x5km = 100x50
		ui.init();
		$('#game').click(function (event) { world.queueInput(event) });
		$(document).keydown(function (event) {
			$('#game').focus();
			world.queueInput(event);
			if ([ 13,17,32,36,38,39,40,65,68,69,70,81,83,87,96 ].includes(event.which)) {
				event.preventDefault();
				return false;
			}
		});
		$('#game').mousemove(function (event) {
			world.queueInput(event);
		});

    var debugStats = {
      lastTwentyTickTimes: [],
      lastTwentyDrawTimes: [],
      index: 0,
      avgTPS: 1,
			delta: 1,
			globalStartTime: moment(),
			currentStartTime: moment(),
			totalTicks: 0,
      addTick: function(tick) {
				this.totalTicks++;
        if (this.lastTwentyTickTimes.length < 20)
          this.lastTwentyTickTimes.push(tick);
        else
          this.lastTwentyTickTimes[this.index] = tick;
      },
      addDraw: function(draw) {
        if (this.lastTwentyDrawTimes.length < 20)
          this.lastTwentyDrawTimes.push(draw);
        else
          this.lastTwentyDrawTimes[this.index] = draw;
        
        this.index++;
        if (this.index > 20) this.index = 0;
      },
      getTPS: function() {
				//return 1000 / ((moment() - this.globalStart) / this.totalTicks);
        if (this.index != 0) return this.avgTPS;
        /*tickTotal = 0;
        for (var tick of this.lastTwentyTickTimes)
          tickTotal += tick;
        drawTotal = 0;
        for (var draw of this.lastTwentyDrawTimes)
          drawTotal += draw;
        this.avgTPS = 1000 / ((tickTotal/this.lastTwentyTickTimes.length) + (drawTotal/this.lastTwentyDrawTimes.length));*/
				var frame = 50 - this.getTimeToWait();
				if (frame <= 0) frame = 1;
				this.avgTPS = 1000 / frame;
				//this.avgTPS = 1000 / ((moment() - this.globalStartTime) / this.totalTicks);
        return this.avgTPS;
      },
			getDelta: function () {
				this.delta = Math.floor(this.lastFrameTime / 50);
				return this.delta ? this.delta : 1;
			},
			getTimeToWait: function() {
				return 50 - this.lastFrameTime < 0 ? 0 : 50 - this.lastFrameTime;
			},
			startUpdate: function() {
				this.currentStartTime = moment();
			},
			completeUpdate: function() {
				this.lastFrameTime = moment() - this.currentStartTime;
			}
    };

		function update() {
			debugStats.startUpdate();

			world.input();
      debugStats.addTick(world.tick(debugStats.getDelta()));
      debugStats.addDraw(world.draw());

			debugStats.completeUpdate();
      ui.updateTimes(debugStats, world);
			setTimeout(update, debugStats.getTimeToWait());
		}
		update();
	}
});