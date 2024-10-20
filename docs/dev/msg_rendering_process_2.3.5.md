- [Workflow](#workflow)
  - [MsgProcessInfo](#msgprocessinfo)
  - [FragmentProcessFunc](#fragmentprocessfunc)
- [Rendered Flag](#rendered-flag)
- [Refs](#refs)


# Workflow

Currently the plugin does NOT rendering all content inside a message box. We only deal with contents that may need go through the markdown renderer. Also, since some element should NOT be considered as Markdown when rendering and should keep what it look like throughout the rendering, we introduced the *Replacer*.

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/c5f986c4-5bb5-410f-8366-c1cffd6c2c3e)

As you see, we consider the `childern` of the message box as pieces. Then we have a list of `FragProcessor` which take in charge of convert the list of HTML children (or you can say: list of pieces) into list of `MsgProcessInfo` object.

## MsgProcessInfo

This refers to object like: `{mark:..., replace:...}`:

- `mark` Determine how it looks like for Markdown Renderer.
- `replace` Determine replace behaviour after markdown render process.

This decide what this element looks like when passed to Markdown Renderer. For example, an element `<span>123</span>` should converted to:

```js
{mark: '123', replace: undefined}
```

And an element that should be replaced later `<img class="face-element__icon"></img>` could be converted to:

```js
{
    mark: '<span id="some_placeholder"></span>', 
    replace: (parent)=>{...}
}
```

## FragmentProcessFunc

The work of generating `MsgProcessInfo` based on HTML pieces is done by a set of function with type `FragmentProcessFunc`.

There is a list of `FragmentProcessFunc`. When iterating pieces, all `FragmentProcessFunc` inside the list will be **triggered from begin to end respectively and preemptively**, which means once a processor successfully returned a `MsgProcessInfo` object, process interrupt and program will continue with next piece.

-----

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/04247260-f2eb-46f3-aae2-1dfa487d8312)


After the process above, we will get a list of `MsgProcessInfo` object. What we need to do is:

- First, accumulate all `mark` from the list, passed it to *Markdown Renderer*, then get a `renderedHtml`.
- Iterating `replace` field of `MsgProcessInfo` list, if not `undefined`, execute the replace function.

# Rendered Flag

We use a special HTML `class` text to mark a message box as `rendered` in `renderSingleMsgBox()` function. When `render()` triggered, it first detect all message box inside UI, then filter the ones that already been rendered. This approach could not only improve the performance but also solve some async issue.

![image](https://github.com/user-attachments/assets/dedce85a-b26e-419c-b740-a42984a06238)

`renderSingleMsgBox()` function is an `async` function. And `render()` will not use `await` to call that function, means if we do nothing, two `renderSingleMsgBox()` could be called at the same time to process the same message box. To ensure only one `renderSingleMsgBox()` function called for each message box, we could put the Rendered detection at the begining of the function:

```js
// skip rendered message
if (messageBox.classList.contains(markdownRenderedClassName)) {
    return;
}
// mark current message as rendered
messageBox.classList.add(markdownRenderedClassName);
```

# Refs

For more info about the process, check out source code file:

- [msgpiece_processor.ts](/src/render/msgpiece_processor.ts)
- [renderer.tsx](/src/renderer.tsx)