Since this plugin retrieve user's text data by using HTML element's `innerHTML` attribute, the data may contains some escaped HTML entities like `&gt;` (`>`). Which may cause markdown render error of blockquote(#38) and fencedcodeblock(#34).

# Rendering Blockquote

For blockquote rendering issue, one work around is to unescape all `&gt;` back to `>` in the string. Doing this could enable Markdown It renderer to regconize blockquote format, and since only `>` has been unescaped, this action should not imposed any XSS vulnurability.

# Rendering Fenced Code Block

All HTML entities may appeared inside a fenced code, so the method above doesn't work and we need to show all HTML entities correctly.

Here we first call `unescapeHtml()` to unescape all HTML Entities in the fenced code. And immediately call `highlight.js` to get rendered fenced code block. As long as the highlight.js correctly rendered the code, this will not impose XSS vulnurability too.

> Here different from previous approach, when we cannot detect the language, use `plaintext` as the `lang` param and pass it to highlight.js instead of using escaped string as result. 
> 
> This could ensure all dangerous HTML string (unescaped string) has go throught highlight.js before being rendered on UI even if it's not in the support language list, and could also avoid HTML entities render error in some case.

# Rendering Custom HTML

Allowing user to render custom HTML tag without any security process is dangerous, however there is still some cases that user do have such needs (#44).

One option to accomplish this without being vulnerable to an XSS exploit is to filter HTML tags before rendering. Here I use [DOMPurify](https://github.com/cure53/DOMPurify) to sanitize the output before rendering back to users' message box.

When HTML rendering enabled, all HTML Entities will be unescaped at the beginning, then passed to Markdown It renderer. In this case, the fenced code block shall NOT unescape the received code again (which may cause HTML entities render error).

Finally, using `DOMPurify.sanitize()` to filter all possible malicious tags, then rendering content back to message box.