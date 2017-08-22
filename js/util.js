define([''],
function() {
  /* Private */
  
  /* Public */
  var util = {
    hexToRgb: function(hex) {
      // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
      var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
      });

      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
      } : null;
    },

    deepCopy: function(array) { // Customized to avoid variables starting with _
			var _out, v, _key;
			_out = Array.isArray(array) ? [] : {};
			for (_key in array) {
        if (_key.charAt(0) == '_') continue; // Skip variables starting with _ which shall now be circular references
				v = array[_key];
				_out[_key] = (typeof v === "object") ? this.deepCopy(v) : v;
			}
			return _out;
    },

    degreesToCardinal: function(degrees) { // Assuming 0deg = East, 90deg = South, etc.
      // Normalize degrees
      while (degrees < 0) degrees += 360;
      while (degrees >= 360) degrees -= 360;
      // Convert to cardinal number
      degrees += 11.25;
      degrees /= 22.5;
      // Convert to cardinal string
      var directions = ['E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW','N','NNE','NE','ENE','E'];
      return directions[Math.floor(degrees)];
    },

    new2dArray(height, width, defaultValue) {
      var arr = new Array(height);
      for (var y = 0; y < arr.length; y++) {
        arr[y] = new Array(width);
        for (var x = 0; x < arr[y].length; x++)
          arr[y][x] = defaultValue;
      }
      return arr;
    },

    getTextDimensions(text, font) {
      // TODO Calculate how many pixels text will take up with the given font
      return {
        width: 0,
        height: 0
      };
    },

    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1);
    }
  }; // End public declarations
  return util;
});