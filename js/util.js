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
    }
  }; // End public declarations
  return util;
});