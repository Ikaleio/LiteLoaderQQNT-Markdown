![React](https://img.shields.io/badge/React-blue?style=for-the-badge&logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=white)
![Typescript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-grey?style=for-the-badge&logo=react&logoColor=white)

- [Introduction](#introduction)
  - [Bundling Using Webpack](#bundling-using-webpack)
  - [Create Release Version](#create-release-version)
- [UI Development](#ui-development)
- [Content Rendering Test Example](#content-rendering-test-example)


# Introduction

For how to clone and build this project, checkout the third method mentioned in [Installation Guide](/docs/plug_install.md).

## Bundling Using Webpack

All markdown rendering business is inside Renderer Process currently, 
and all code in Renderer process has been bundled to `dist/renderer.js` using `webpack`. 
So before start developing, run `npm install` to get all dependencies.

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

## Create Release Version

`dist` directory is not included in `git`, to create a release version of this extension, please run:

```shell
npm run release
```

This script will:

- First use `git archive` to create a `release.zip` file contains all code included in `git`.
- Use `zip -r` to add `dist` directory into previously generated `release.zip`.

# UI Development

You could use `React` to develop plugin settings UI interface. The entrance of user settings page is `src/components/setting_page.js`

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