Since this plugin retrieve user's text data by using HTML element's `innerHTML` attribute, the data may contains some escaped HTML entities like `&gt;` (`>`). Which may cause markdown render error of blockquote(#38) and fencedcodeblock(#34).

# Rendering Blockquote

For blockquote rendering issue, one work around is to unescape all `&gt;` back to `>` in the string. Doing this could enable Markdown It renderer to regconize blockquote format, and since only `>` has been unescaped, this action should not impose any XSS vulnurability.

# Rendering Fenced Code Block

All HTML entities may appeared inside a fenced code, so the method above doesn't work and we need to show all HTML entities correctly.

Here we first call `unescapeHtml()` to unescape all HTML Entities in the fenced code. And immediately call `highlight.js` to get rendered fenced code block. As long as the highlight.js correctly rendered the code, this will not impose XSS vulnurability too.

> Here different from previous approach, when we cannot detect the language, use `plaintext` as the `lang` param and pass it to highlight.js instead of using escaped string as result. 
> 
> This could ensure all dangerous HTML string (unescaped string) has go through highlight.js before being rendered on UI even if it's not in the support language list, and could also avoid HTML entities render error in some case.

# Rendering Custom HTML

Allowing user to render custom HTML tag without any security process is dangerous, however there is still some cases that user do have such needs (#44).

One option to accomplish this without being vulnerable to an XSS exploit is to filter HTML tags before rendering. Here I use [DOMPurify](https://github.com/cure53/DOMPurify) to sanitize the output before rendering back to users' message box.

When HTML rendering enabled, all HTML Entities will be unescaped at the beginning, then passed to Markdown It renderer. In this case, the fenced code block shall NOT unescape the received code again (which may cause HTML entities render error).

Finally, using `DOMPurify.sanitize()` to filter all possible malicious tags, then rendering content back to message box.

# LaTeX Rendering with HTML Entities

Version `<=1.1.0` may experience rendering issue when Inline Latex and Latex Block which contains HTML Entities. The reason is same as above: HTML Entities has been escaped.

In above when solving Fenced Code Rendering issue, we manually unescaped HTML Entities in function that passed to `highlight`. However there is no any method we could "plug-in" our code to MarkdownIt Katex plugin.

To solve this, we need to use a mild modified version of `markdown-it-katex`, the midification has been described below:

```js
// Add this function to katex/index.js
function unescapeHtml(unsafe) {
    return unsafe
        .replace(/&amp;/g, "\&")
        .replace(/&lt;/g, "\<")
        .replace(/&gt;/g, "\>")
        .replace(/&quot;/g, "\"")
        .replace(/&#039;/g, "\'");
}

// set KaTeX as the renderer for markdown-it-simplemath
var katexInline = function (latex) {
    latex = unescapeHtml(latex); // Add this line. Work with QQNT Markdown-it
    options.displayMode = false;
    try {
        return katex.renderToString(latex, options);
    }
    catch (error) {
        if (options.throwOnError) { console.log(error); }
        return `<span class='katex-error' title='${escapeHtml(error.toString())}'>${escapeHtml(latex)}</span>`;
    }
};

var inlineRenderer = function (tokens, idx) {
    return katexInline(tokens[idx].content);
};

var katexBlock = function (latex) {
    latex = unescapeHtml(latex); // Add this line. Work with QQNT Markdown-it
    options.displayMode = true;
    try {
        return `<p class="katex-block ${options.blockClass}">` + katex.renderToString(latex, options) + "</p>";
    }
    catch (error) {
        if (options.throwOnError) { console.log(error); }
        return `<p class='katex-block katex-error ${options.blockClass
            }' title='${escapeHtml(error.toString())}'>${escapeHtml(latex)}</p>`;
    }
}
```

In case that latex has been rendered successfully, all possible HTML Entities has been converted to latex span. And wzhen error occurred while rendering latex, the raw info will go through `escapeHtml()` before rendering, so in both case there is no XSS vulnurability.

The relavant script has been directly added to this git repo now as `src/lib/markdown-it-katex.js`.

# Inline Code Rendering with HTML Entities

This issue is similar to the *Fenced Code Rendering* one. Default renderer of *Inline Code* in MarkdownIt will perform HTML Entity Escape before rendering, which is unnecessary since QQ already preform HTML escape to user-sent content. To solve this:

- When HTML Rendering enabled, all HTML Entities will be unescaped at first, so this issue solved.
- When HTML Rendering not enabled, pass custom inline render to MarkdownIt which would skip escapeHTML process, issue solved.