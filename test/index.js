'use strict';

var fs = require('fs');
var browserify = require('browserify');
var through2 = require('through2');
var multistream = require('multistream');
var run = require('tape-run');
var transform = require('../');

var tests = [
  {
    name: 'basic-runtime',
    opts: {runtime: true}
  },
  {
    name: 'basic-buildtime',
    opts: {runtime: true}
  }
];

var runner = run();
runner.on('results', function(results) {
  if (!results.ok) {
    process.exit(1);
  }
});
runner.pipe(process.stdout);

var testStreams = tests.map(function() {
  return through2();
});
var tapeStream = through2();
var outputStream = multistream([tapeStream].concat(testStreams));
outputStream.pipe(runner);

bundleTape();
tests.forEach(testFromConfig);

function testFromConfig(config, index) {
  var testPath = './test/' + config.name + '.js';
  runBrowserify(testPath, config.opts, testStreams[index]);
}

function bundleTape() {
  var b = browserify();
  b.require('tape');
  b.bundle().pipe(tapeStream);
}

function runBrowserify(sourcePath, transformOpts, output) {
  var b = browserify(sourcePath);
  b.external('tape');
  b.transform(transform, transformOpts);
  b.transform('brfs');
  b.bundle().pipe(output);
}
