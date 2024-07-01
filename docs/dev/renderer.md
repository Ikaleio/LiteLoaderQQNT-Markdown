Markdwon rendering task has been moved to Renderer process.



# Development

## Bundling

All code in Renderer process has been bundled to `dist/renderer.js` using `webpack`.

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

# UI Development

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

# Content Rendering Test Example

You could use Markdown below as a quick Markdown Rendering Test.

    # Display Test

    ## Normal

    Normal test

    Normal test with HTML Entities & " ' < > .

    ## List 

    - List Item
    - List Item

    1. Ordered List
    2. Ordered List

    ## Blockquote

    > Test
    >
    >> Nested Test

    ## Code

    Inline Code test `int main(){ return 0; }`

    Inline Code test with HTML Entities: `<p>Hello!</p>`

    ```
    // Cpp Code Test
    #include <iostream>
    int a = 0;
    int& b = a;
    ```

    ```
    Plain text with HTML Entities <p>Hello</p>
    ```

    ## LaTeX

    $$
    \displaystyle \left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)
    $$

Example Output Screenshot:

![image](https://github.com/nfnfgo/LiteLoaderQQNT-Markdown/assets/61616918/79a80462-12f1-4008-9d20-7b029661c000)