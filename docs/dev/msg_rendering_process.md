- [Workflow](#workflow)
  - [Fragments](#fragments)
  - [Fragment Processor](#fragment-processor)
  - [Children Replacement](#children-replacement)
- [Rendered Flag](#rendered-flag)
- [Global \& MessageRendered Callback](#global--messagerendered-callback)
- [Refs](#refs)


# Workflow

Currently the plugin does NOT rendering all content inside a message box. We only deal with contents that may need go through the markdown renderer. Also, since some element should NOT be considered as Markdown when rendering and should keep what it look like throughout the rendering, we introduced the concept of **Fragment Processor** _(FragProcessor)_.

## Fragments

When dealing with QQNT messages, we considered a message `span` as a basic rendering unit. A general QQNT message HTML element has the folloing structure:

```
- span.mix-message__inner
  - span.text_element
    - span / p / ...
  - span.text_element_at
  - span.other_element
```

In conclusion:

- A `span.mix-message__inner` is related to a single message box, we will use `msgBox` to refer to it below.
- A `msgBox` could have multiple `span.*_element_*` span, which's classname indictas the content type of this span, for example, a pure text, an emoji or a image etc.

Here, we **consider the `span` children of the msgBox as the "fragments" of this message**. Then we have **a list of `FragProcessor`, each takes in charge of catching and rendering a certain type of fragments**.

For example, we could have:

- `TextFragProcessor` who deal with `span.text-element` fragments.
- `EmojiFragProcessor` who deal with emoji info in fragments.
- ...

## Fragment Processor

Definition:

```typescript
type FragmentProcessFunc = (
    parent: HTMLElement,
    element: HTMLElement,
    index: number,
) => FragmentProcessFuncRetType | undefined;
```

When `render()` function is triggered, for **each fragment** in each message, a **provided list of Fragment Processor** will be iterated from begin to end **respectively and preemptively**.

This means, for a single fragment, once a processor successfully returned a not `undefined` value *(actually it should be `FragmentProcessFuncRetType` obejct)*, the loop is end and the return value is used for this fragment.

![Fragment Processor](https://github.com/user-attachments/assets/670dd3f2-7660-4a59-99bb-9e985f19d323)

## Children Replacement

Let's look into the return type of `FragmentProcessFunc`:

```typescript
interface FragmentProcessFuncRetType {
    original: HTMLElement;
    rendered: HTMLElement;
}
```

As you see, it specified the `original` SPAN element, and a new `rendered` element. For now, we just replace the `original` child of `messageBox` with `rendered`.

> [!note]
>
> Keep in mind that the `original` HTML element passed to Fragment Processor could be directly updated. 
> 
> In some cases, Fragment Processor function may directly mutated the `original` HTML element due to performance or other consideration. In this case, `original===rendered` should be true in the returned `FragmentProcessFuncRetType`.

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

# Global & MessageRendered Callback

- For the task that need to be done directly after a message is rendered, put it at the end of `renderSingleMsgBox()` function.
- For the task that need to be done after a whole rendering is finished, put it at the end of `renderer()` function.

> TODO:
>
> Add a more general callback protocol and manager for rendering process.

# Refs

For more info about the process, check out source code file:

- [msgpiece_processor.ts](/src/render/msgpiece_processor.ts)
- [renderer.tsx](/src/renderer.tsx)

For outdated doc:

- [Message Rendering Process Doc 2.3.5](./msg_rendering_process_2.3.5.md)
