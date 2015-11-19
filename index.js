'use strict';

var through = require('through2');
var requireFromString = require('require-from-string');

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

function transformRuntime(source, filename) {
  var styles = requireFromString(source, filename);
  var result = scopeStyles(styles);
  return [
    'var cssKey = require(\'scope-styles/lib/css-symbol\');',
    'var result = ' + JSON.stringify(result) + '};',
    'result[cssKey] = \'' + scopeStyles.getCss(result) + '\';',
    'module.exports = result;'
  ].join('\n');
}

function transformBuildtime(source, filename) {
  return 'module.exports = {lol: 1337};'
}

function matchesExtension(filename, extension) {
  var start = filename.length - extension.length;
  var end = filename.length;
  return filename.substring(start, end) === extension;
}

