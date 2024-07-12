This document is used to record some Known Issue of this plugin.

# Compatability Issue With Other Plugin

Currently we found that sometimes it would cause incorrect rendering behaviour when using this plugin with `LiteTools`(another QQNT plugin). And user may experience:

- Incorrect LiteTools Slot rendering position. For example, the *Message Send Time* and *Withdrawed* slot may be rendered with incorrect position / alignment.

Currently the workaround for the LiteTool Time slot is to use JavaScript to observe the `offsetHeight` of each message box. If it over a specific value, we consider this message a multiple-line message and set the `flex-direction: column` to the root message box, otherwise set `flex-direction: row`.

This require change message box div into `flex` which may cause other rendering issue, and this workaround should be replaced by a better solution.

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