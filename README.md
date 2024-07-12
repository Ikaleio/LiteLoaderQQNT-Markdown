# LiteLoaderQQNT-Markdown

![GitHub Release](https://img.shields.io/github/v/release/d0j1a1701/LiteLoaderQQNT-Markdown?style=for-the-badge&logo=github) ![GitHub License](https://img.shields.io/github/license/d0j1a1701/LiteLoaderQQNT-Markdown?style=for-the-badge&color=blue) ![GitHub last commit](https://img.shields.io/github/last-commit/d0j1a1701/LiteLoaderQQNT-Markdown?style=for-the-badge&logo=github)
 ![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/d0j1a1701/LiteLoaderQQNT-Markdown?style=for-the-badge&color=rgb(50%2C180%2C50))


## 简介

这是一个 [LiteLoaderQQNT](https://github.com/mo-jinran/LiteLoaderQQNT) 插件，使用 [Markdown-it](https://github.com/markdown-it/markdown-it) 为 QQNT 增加 Markdown 和 $\LaTeX$ 以及 HTML渲染功能！

## 安装本插件

您可以跟随[本插件的安装引导](./docs/plug_install.md)为自己的QQNT安装本插件。

## 功能

### 标准 Markdown 语法的消息渲染

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/41b9fa09-c888-4b06-822b-7384d3b05df6)

<details><summary>对应消息原文本</summary>

```markdown
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
```

</details>

### 代码块渲染和高亮


![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/22acdfa7-a033-4269-839c-04ca829f0a5a)

<details><summary>对应消息原文本</summary>

    ```javascript
    // Declare a function
    function myFunction() {
    document.getElementById("demo").innerHTML = "Hello World!";
    }

    // Call the function
    myFunction();
    ```

</details>

### $\LaTeX$ 公式进行渲染（基于 [KaTeX](https://katex.org/) ）

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/343a74b7-1c35-46a6-af15-e5ad7eb82376)

<details><summary>对应消息原文本</summary>

    Inline LaTeX Here: $e^{i\pi} + 1 = 0$!

    LaTeX Block also available!

    $$
    \displaystyle \left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)
    $$

</details>

### 支持第三方主题

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/48874489/be3b2aff-e69d-4655-aab6-912632b9d51c)

图中的主题是 [MUKAPP/LiteLoaderQQNT-MSpring-Theme](https://github.com/MUKAPP/LiteLoaderQQNT-MSpring-Theme)。

<details><summary>对应消息原文本</summary>

    # Markdown test
    `inline code test`
    **加粗**~~删除~~__下划线__
    [这是个链](https://d0j1a1701.cc)
    $\LaTeX \color{red}{red text}$
    ```cpp
    #include <iostream>
    using namespace std;
    int main(){
        cout << "Meow" << endl;
        return 0;
    }
    ```
    > This is a quote test.

</details>

## 注意事项

您可以查看本项目的 [Known Issue](/docs/known_issue.md) 查看已经发现以及仍未解决的问题。

如果在使用插件时遇到问题，您可以通过 [发起 Issue](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/issues/new) 向我们进行反馈。届时请尽可能附上诸如系统版本，插件列表， LiteLoaderQQNT 设置页版本信息截图等可以帮助分析问题的信息。如果你还安装了远程调试插件，可以再附上 Devtools 信息。

## Contributing

如果您想要为本项目贡献代码，或者想了解本项目的代码相关细节，欢迎阅读 [项目开发文档](/docs/dev/renderer.md) 。