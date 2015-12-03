'use strict';

var fs = require('fs');
var browserify = require('browserify');
var concat = require('concat-stream');
var test = require('tape');
var transform = require('../');

var tests = [
  {
    name: 'basic-runtime',
    opts: {runtime: true}
  },
  {
    name: 'basic-buildtime',
    opts: {runtime: false}
  }
];

test('transforms correctly', function (t) {
  t.plan(tests.length);
   var testStreams = tests.map(function(config) {
    return concat(function(code) {
      t.test(config.name, function(assert) {
        var expected = fs.readFileSync('./test/' + config.name + '.expected.js', 'utf8');
        assert.equal(code.toString(), expected, 'output matches expected');
        assert.end();
      });
    });
  });

  tests.forEach(testFromConfig);

  function testFromConfig(config, index) {
    var fixturePath = './test/basic.source.js';
    browserifyFixture(fixturePath, config.opts, testStreams[index]);
  }

  function browserifyFixture(fixture, transformOpts, output) {
    var b = browserify(fixture);
    b.exclude('scope-styles');
    b.exclude('insert-css');
    b.exclude('scope-styles-injectify/scope-styles-inject');
    b.transform(transform, transformOpts);
    b.bundle().pipe(output);
  }
});
