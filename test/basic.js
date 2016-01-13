'use strict';

var scopeStyles = require('scope-styles');

var styles = {
  foo: {
    color: 'red'
  }
};

var scoped = scopeStyles(styles);
