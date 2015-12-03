# scope-styles-injectify

[![build status][build-badge]][build-href]
[![coverage status][coverage-badge]][coverage-href]
[![dependencies status][deps-badge]][deps-href]

Browserify transform to automatically inject the scoped css from [scope-styles](https://github.com/rtsao/scope-styles) into the page

### CLI usage

```
browserify -t [ scope-styles-extractify --runtime=true ] main.js
```

### API usage

```javascript
var browserify = require('browserify');
var extractify = require('scoped-styles-extractify');

var b = browserify('./main.js');
b.transform(extractify, {runtime: false});
b.bundle();
```

### options


* _**runtime**_ Boolean, default is `false`
 * Whether scope-styles should evaluate style objects at runtime (in browser) or at buildtime.
 * If `false`, the style object is evaluated at buildtime and the code to inject the css is inlined.
 * If `true`, scope-styles is merely replaced with [scope-styles-inject](https://github.com/rtsao/scope-styles-inject).

[build-badge]: https://travis-ci.org/rtsao/scope-styles-injectify.svg?branch=master
[build-href]: https://travis-ci.org/rtsao/scope-styles-injectify
[coverage-badge]: https://coveralls.io/repos/rtsao/scope-styles-injectify/badge.svg?branch=master&service=github
[coverage-href]: https://coveralls.io/github/rtsao/scope-styles-injectify?branch=master
[deps-badge]: https://david-dm.org/rtsao/scope-styles-injectify.svg
[deps-href]: https://david-dm.org/rtsao/scope-styles-injectify
