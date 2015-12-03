'use strict';

var scopeStyles = require('scope-styles');

var scoped = scopeStyles({
  foo: {
    color: 'red',
    background: typeof window === 'undefined' ? 'blue' : 'green'
  }
});
