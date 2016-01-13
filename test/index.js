'use strict';

require('exit-code');

var fs = require('fs');
var browserify = require('browserify');
var through2 = require('through2');
var multistream = require('multistream');
var run = require('tape-run');
var merge = require('tap-merge');
var finished = require('tap-finished');

var transform = require('../');

var tests = [
  {
    fixture: 'basic-runtime',
    opts: {runtime: true}
  },
  {
    fixture: 'basic-buildtime',
    opts: {runtime: false}
  }
].map(addStream);

tests.forEach(testFromConfig);

var output = multistream(tests.map(getStream))
  .pipe(merge())
  .pipe(through2());

output.pipe(finished(function setExitCode(result) {
  process.exitCode = result.ok ? 0 : 1;
}));

output.pipe(process.stdout);

function testFromConfig(config, index) {
  var fixturePath =  config.fixture + '.js';
  var testPath =  config.fixture + '.test.js';

  var runner = run();
  runner.pipe(config.stream);

  runBrowserify(testPath, fixturePath, config.opts)
    .pipe(runner);
}

function runBrowserify(sourcePath, fixturePath, transformOpts) {
  var b = browserify('./test/' + sourcePath);
  b.transform(transform, transformOpts);
  b.transform('brfs');
  return b.bundle();
}

function addStream(test) {
  test.stream = through2();
  return test;
}

function getStream(test) {
  return test.stream;
}

function reduceResult(acc, data) {
  console.log(acc, data.toString());
  return acc && data.toString() === 'pass';
}
