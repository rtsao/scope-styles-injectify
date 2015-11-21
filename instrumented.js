'use strict';

var scopeStyles = require('scope-styles');

var css = {};

function instrumentedScopeStyles(filename) {
  var result = scopeStyles.apply(null, arguments);
  css[filename] += scopeStyles.getCss(result);
  return result;
}

instrumentedScopeStyles.getCSs = scopeStyles.getCss;

module.exports = {
  instrument: instrumentedScopeStyles,
  getCss: function getCss(filename) {
    return css[filename];
  }
};
