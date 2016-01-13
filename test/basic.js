'use strict';

var scopeStyles = require('scope-styles');

var isBuildtime = typeof window === 'undefined';

var styles = {
  foo: {
    color: 'red',
    content: isBuildtime ? '"buildtime"' : '"runtime"'
  }
};

var scoped = scopeStyles(styles);
