我刚开始打算尝试使用 `beforeSanitize` 那个 hook，先行自行检测tagName在不在allowed里面，如果不在就先转成string.

遇到的问题有：

- DOMPurify 不暴露有关于allowedTag的接口。