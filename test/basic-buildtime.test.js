'use strict';

require('./basic');

var fs = require('fs');
var test = require('tape');

var expectedCss = fs.readFileSync(__dirname + '/basic.expected.css', 'utf8');

test('basic buildtime', function t(assert) {
  var style = document.querySelector('style');
  assert.ok(style, 'style tag exists');
  assert.equal(style.textContent, expectedCss, 'css should match expected');
  assert.end();
});
