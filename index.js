'use strict';

var through = require('through2');
var requireFromString = require('require-from-string');
var cssKey = require('scope-styles/lib/css-symbol');

module.exports = function (filename, opts) {
  var extension = '.style.js';
  var runtime = true;

  if (!matchesExtension(filename, extension)) {
    return through();
  }

  var output = through(function(buf, enc, next) {
    var source = buf.toString('utf8');
    var transformer = runtime ? transformRuntime : transformBuildtime;

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

function matchesExtension(filename, extension) {
  var start = filename.length - extension.length;
  var end = filename.length;
  return filename.substring(start, end) === extension;
}

function walkAst(source, walkFn) {
  return falafel(source, {
    parser: acorn,
    ecmaVersion: 6,
    sourceType: 'module'
  }, walkFn);
}

/*
 * Runtime Transformation
 */

function transformRuntime(source, filename) {
  return walkAst(source, swapScopeStyles);
}

var regex = /(['"`])scope-styles\1/;

function swapScopeStyles(node) {
  if (node.type === 'ImportDeclaration') {
    node.update(node.source().replace(regex,
      '$1scope-styles-injectify/scope-styles-inject$1'));
  } else if (isRequireScopeStyles(node)) {
    var quote = node.arguments[0].raw[0][0];
    var str = quote + 'scope-styles-injectify/scope-styles-inject' + quote;
    node.arguments[0].update(str);
  }
}

/*
 * Buildtime Transformation
 */

function transformBuildtime(source, filename) {
  // var instrumentedModule = walkAst(source, instrumentedModule);
  var instrumentedModule = source + ';module.exports[require("scope-styles/lib/css-symbol")] = "stuff";'
  var css = requireFromString(instrumentedModule)[cssKey];
  return source + ';require("insert-css")(' + css + ');';
}

function instrumentModule(node) {
  if (node.type === 'ImportDeclaration') {
    // handle possible scope styles action
  } else if (isRequireScopeStyles(node)) {
    if (node.arguments[0].value === 'scope-styles') {
      // handle stuff
    }
  }
}

/*
 * General AST Helpers
 */

function isRequireScopeStyles(node) {
  return node.callee &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0] &&
    node.arguments[0].value === 'scope-styles';
}
