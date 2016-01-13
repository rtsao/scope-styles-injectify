'use strict';

var through = require('through2');
var acorn = require('acorn');
var falafel = require('falafel');
var requireFromString = require('require-from-string');
var cssKey = require('scope-styles/lib/css-symbol');
var extend = require('xtend');

module.exports = function (filename, opts) {
  opts = extend({
    runtime: false
  }, opts);

  var output = through(function(buf, enc, next) {
    var source = buf.toString('utf8');
    var transformer = opts.runtime ? transformRuntime : transformBuildtime;
    try {
      var transformedSource = transformer(source, filename);
    } catch (err) {
      return error(err);
    }
    this.push(transformedSource);
    next();
  });

  function error(msg) {
    var err = typeof msg === 'string' ? new Error(msg) : msg;
    output.emit('error', err);
  }

  return output;
};

/*
 * Runtime Transformation
 */

function transformRuntime(source, filename) {
  return transformAst(source, swapScopeStyles);
}

function swapScopeStyles(node) {
  if (isRequireScopeStyles(node)) {
    var quote = node.arguments[0].raw[0][0];
    var str = quote + 'scope-styles-injectify/scope-styles-inject' + quote;
    node.arguments[0].update(str);
  }
}

/*
 * Buildtime Transformation
 */

function transformBuildtime(source, filename) {
  var didInstrument = false;
  var instrumentedModule = transformAst(source, function instrumentModule(node) {
    if (isRequireScopeStyles(node)) {
      var quote = node.arguments[0].raw[0][0];
      var str = quote + 'scope-styles-injectify/instrumented' + quote;
      node.arguments[0].update(str);
      node.update(node.source() + '.instrument(__filename)');
      didInstrument = true;
    }
  });
  return didInstrument ? addBuildtimeCss(source, instrumentedModule, filename) : source;
}

function addBuildtimeCss(original, instrumented, filename) {
  var css = getCss(instrumented, filename);
  return original + ';require("insert-css")(' + JSON.stringify(css) + ');';
}

var exporter = ';module.exports[require("scope-styles/lib/css-symbol")] = require("scope-styles-injectify/instrumented").getCss(__filename);';

function getCss(instrumentedModule, filename) {
  return requireFromString(instrumentedModule + exporter, filename)[cssKey];
  return stuff;
}

/*
 * General AST Helpers
 */

function transformAst(source, walkFn) {
  return falafel(source, {
    parser: acorn,
    ecmaVersion: 6,
    sourceType: 'module'
  }, walkFn).toString();
}

function isRequireScopeStyles(node) {
  return node.callee &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0] &&
    node.arguments[0].value === 'scope-styles';
}
