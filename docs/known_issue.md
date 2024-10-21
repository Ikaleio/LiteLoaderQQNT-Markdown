This document is used to record some Known Issue of this plugin.

# Post Rendering Function Exec Order Issue

Currently, we call `renderSingleMsgBox()` function inside `render()`, then after we call some post-rendering functions, the whole process is like: 

```js
msgBoxs.forEach((box){
    renderSingleMsgBox(box);  // actually async
})

// these function may run first before every msgbox finish rendering
changeDirectionToColumnWhenLargerHeight();
elementDebugLogger();
```

However the issue is the *MarkdownIt* render function returns Promise, so the `renderSingleMsgBox()` is an async function. And so, the post-rendering function below actually may run first while the message is not fully rendererd.

Currently we do NOT implement any workaround on this since the test show this issue don't affect the rendering result for now. However this is something that should be fixed in the future.
