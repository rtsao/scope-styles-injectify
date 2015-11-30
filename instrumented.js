'use strict';

var scopeStyles = require('scope-styles');

var css = {};

function instrumentScopeStyles(filename) {
  if (!css[filename]) {
    css[filename] = '';
  }
  function instrumentedScopeStyles() {
    var result = scopeStyles.apply(null, arguments);
    css[filename] += scopeStyles.getCss(result);
    return result;
  }
  instrumentedScopeStyles.getCSs = scopeStyles.getCss;
  return instrumentedScopeStyles;
}

module.exports = {
  instrument: instrumentScopeStyles,
  getCss: function getCss(filename) {
    return css[filename];
  }
};
