'use strict';

require('exit-code');

var fs = require('fs');
var browserify = require('browserify');
var through2 = require('through2');
var multistream = require('multistream');
var reduce = require('stream-reduce');
var run = require('tape-run');
var merge = require('tap-merge');

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

var results = tests.map(testFromConfig);
multistream(results)
  .pipe(reduce(reduceResult, true))
  .on('data', function(didPass) {
    process.exitCode = didPass ? 0 : 1;
  });

var testStreams = tests.map(getStream);
multistream(testStreams)
  .pipe(merge())
  .pipe(process.stdout);

function testFromConfig(config, index) {
  var fixturePath =  config.fixture + '.js';
  var testPath =  config.fixture + '.test.js';

  var runner = run();

  var resultStream = through2();

  runner.pipe(config.stream);
  runner.on('results', function(a) {
    resultStream.push(a.ok ? 'pass' : 'fail');
    resultStream.push(null);
  });

  runBrowserify(testPath, fixturePath, config.opts)
    .pipe(runner);

  return resultStream;
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
