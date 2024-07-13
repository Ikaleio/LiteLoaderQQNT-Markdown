![React](https://img.shields.io/badge/React-blue?style=for-the-badge&logo=react&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=white)
![Typescript](https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-grey?style=for-the-badge&logo=webpack&logoColor=white)

- [Introduction](#introduction)
  - [Start Developing](#start-developing)
  - [Logging](#logging)
  - [Create Release Version](#create-release-version)
  - [UI Development](#ui-development)
- [Read More](#read-more)
- [Content Rendering Test Example](#content-rendering-test-example)


# Introduction

For how to clone and build this project, checkout the third method mentioned in [Installation Guide](/docs/plug_install.md).

## Start Developing

First of all, run:

```shell
npm install
```

This will help you get all deps used by this project. Then you can call:

```shell
npm run dev
```

This will start `webpack` in watch mode with `development` flag enabled.

## Logging

A custom `conole` wrapper `mditLogger` is recommend when you need to log something in *Renderer Process*. You can import the logger by:

```javascript
import { mditLogger } from './utils/logger';

function someFunc() {
  mditLogger('debug', 'debug info here.'); // Output: [MarkdownIt] debug info here.
}
```



Use `mditLogger` whenever possible.

## Create Release Version

To create a release version of this extension, please run:

```shell
npm run release # create Release.zip with ./dist included
```

The script `npm run release` will:

1. Run `npm run build` to generate `./dist` resources.
2. Run `git archive` to create a `release.zip` file contains all code included in `git`.
3. Run `zip -r` to add `dist` directory into previously generated `release.zip`.

## UI Development

You could use `React` to develop plugin settings UI interface. The entrance of user settings page is `src/components/setting_page.js`

```js
// react_component_file.js
import React from 'react';

export function YourComponentHere(){
    return (<p>Test</p>);
}
```

Currently support file extension for `webpack` contains:

- `.js`
- `.jsx`
- `.ts`
- `.tsx`

# Read More

[Message Rendering Process](./msg_rendering_process.md)

[HTML Entities Processing](./msg_rendering_process.md)

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