Markdwon rendering task has been moved to Renderer process.



# Development

## Bundling

All code in Renderer process has been bundled to `dist/renderer.js` using `webpack`. To ensure that users can start using this extension directly after executing `git clone`, this bundled file should be included in `git`.

Before start developing, run `npm install` to get all dependencies.

For a better dev experience, you could change the webpack config:

```js
module.exports = {

    watch: true,            // rebundle when file changed
    mode: 'development',    // enable webpack development mode
                            // check out https://webpack.js.org/configuration/mode/ for more info.
    ...// other configs
};
```

> Remember to change mode back to `production` when bundling release version.

## UI Development

You could use `React` to develop plugin settings UI interface.

```js
// react_component_file.js
import React from 'react';

export function YourComponentHere(){
    return (<p>Test</p>);
}
```

Currently only `.js` file extension is supported, using `.jsx` may cause webpack package resolve error.

> This might be solved by provide custom package resolve rules to webpack but I didn't look into it.