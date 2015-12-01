# scope-styles-injectify

Browserify transform to automatically inject the scoped css from [scope-styles](https://github.com/rtsao/scope-styles) into the page

### CLI usage

```
browserify -t [ scope-styles-extractify --runtime=true ] example/index.js
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
 * Whether scope-styles should evaluate style objects at runtime or at buildtime.
 * If `false`, the style object is evaluated at buildtime and the code to inject the css is inlined.
 * If `true`, scope-styles is merely replaced with [scope-styles-inject](https://github.com/rtsao/scope-styles-inject).
