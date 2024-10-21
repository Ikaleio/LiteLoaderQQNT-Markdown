// 运行在 Electron 渲染进程 下的页面脚本
const { createRoot } = require("react-dom/client");
import React from 'react';


(React as any).createRoot = createRoot;
import { SettingPage } from "./components/setting_page";

const hljs = require('highlight.js');
import markdownIt from 'markdown-it';


// Components
import {
  HighLightedCodeBlock,
  addOnClickHandleForCopyButton,
  renderInlineCodeBlockString,
  addOnClickHandleForLatexBlock,
  changeDirectionToColumnWhenLargerHeight
} from './components/code_block';
import { ShowOriginalContentButton, addShowOriginButtonToMarkdownBody } from '@/components/show_origin';

// States
import { useSettingsStore } from '@/states/settings';

// Utils
import { debounce } from 'throttle-debounce';
import { mditLogger, elementDebugLogger } from './utils/logger';
import { MsgProcessInfo, processorList } from '@/render/msgpiece_processor';

// Types
import { LiteLoaderInterFace } from '@/utils/liteloader_type';

declare const LiteLoader: LiteLoaderInterFace<Object>;
const markdownRenderedClassName = 'markdown-rendered';
const markdownIgnoredPieceClassName = 'mdit-ignored';
let markdownItIns: markdownIt | undefined = undefined;

onLoad();




const debouncedRender = debounce(50, render, { atBegin: false },);

/**
 * Root markdown render function.
 *
 * This function will get called once change of msgList is detected and a possible rerender is required.
 */
function render() {
  // return;
  mditLogger('debug', 'renderer() triggered');

  const settings = useSettingsStore.getState();

  const elements = document.querySelectorAll(".message-content");

  let newlyFoundMsgList = Array.from(elements)
    // 跳过已渲染的消息
    .filter((messageBox) => (!messageBox.classList.contains(markdownRenderedClassName)))
    // 跳过空消息
    .filter((messageBox) => messageBox.childNodes.length > 0);

  mditLogger('debug', 'Newly found message count:', newlyFoundMsgList.length);

  for (let msgBox of newlyFoundMsgList) {
    try {
      renderSingleMsgBox(msgBox as HTMLElement);
    } catch (e) {
      mditLogger('debug', 'Render msgbox failed', e);
    }
  }

  // code that runs after renderer work finished.
  changeDirectionToColumnWhenLargerHeight();
  elementDebugLogger();
}

/**
 * Markdown body process function used in render() to add openExternal()
 * behavior to all links inside rendered markdownBody.
 */
function handleExternalLink(markdownBody: HTMLElement) {
  markdownBody.querySelectorAll("a").forEach((e) => {
    e.classList.add("markdown_it_link");
    e.classList.add("text-link");
    e.onclick = async (event) => {
      event.preventDefault();
      const href = (event.composedPath()[0] as any).href.replace("app://./renderer/", "");
      await LiteLoader.api.openExternal(href);
      return false;
    };
  });
}

async function renderSingleMsgBox(messageBox: HTMLElement) {
  const settings = useSettingsStore.getState();

  // For more info about Rendered class mark,
  // checkout: docs/dev/msg_rendering_process.md
  // skip rendered message
  if (messageBox.classList.contains(markdownRenderedClassName)) {
    return;
  }

  // mark the current message as rendered
  messageBox.classList.add(markdownRenderedClassName);

  // original innerHTML for message box.
  // This is captured and used by "Show Original" feature.
  let msgBoxOriginalInnerHTML = messageBox.innerHTML;

  // Get all children of message box. Return if length is zero.
  const originalSpanList = Array.from(messageBox.children);
  mditLogger('debug', 'renderSingleMsgBox', 'originalSpanList:', originalSpanList);
  if (originalSpanList.length == 0) return;

  // used as pivot when we're inserting rendered elements later.
  // const posBase = document.createElement('span')
  // originalSpanList[0].before(posBase);

  // Here using entityProcess which may finally call DOMParser().parseFromString(input, "text/html");
  // This may introduce XSS attack vulnerability, however, we will use DOMPurify to prevent all
  // dangerous HTML elements when rendering markdown.


  // use fragment processors to deal with the span in messages one by one
  // finally, we will get a list of rendered span
  const renderedSpanInfo = originalSpanList.map((msgSpan, index) => {
    mditLogger('debug', 'PieceProcessor', 'Original Piece:', msgSpan);

    // Try to apply piece processor in order. Stop once a processor could process current msgPiece
    for (let processor of processorList) {
      // try get the return value of the processor
      let renderedSpan = processor(messageBox, (msgSpan as HTMLElement), index);
      // if processor returned a non-undefined value, use the new element
      if (renderedSpan !== undefined) {
        return renderedSpan;
      }
    }

    // here means no any frag processor could handle this msgSpan, just return itself, 
    // in other word, keep it's original looks.
    return { original: msgSpan, rendered: msgSpan };

    // if undefined, this element should be ignored and not be removed in later process.
    // if (retInfo === undefined) {
    //   msgPiece.classList.add(markdownIgnoredPieceClassName);
    // }
    // mditLogger('debug', 'PieceProcessor', 'Piece processor return:', retInfo);
    // return retInfo;
  });

  mditLogger('debug', 'RenderedList generated, start replacing messagebox children...');

  // replace the children based on rendered info
  for (let renderedInfo of renderedSpanInfo) {
    mditLogger('debug', 'Try to replace:', renderedInfo);
    let originalIsChildren = originalSpanList.some((e) => e === renderedInfo.original);
    // mditLogger('debug', 'Original element in messageBox:', originalIsChildren);
    messageBox.replaceChild(renderedInfo.rendered, renderedInfo.original);
  }


  // 渲染 markdown
  // const marks = markPieces.filter(p => p !== undefined).map((p) => p.mark).reduce((acc, p) => acc + p, "");
  // mditLogger('debug', 'MarkdownRender Input:', marks);
  // let renderedHtml = renderedHtmlProcessor(await generateMarkdownIns().render(marks));
  // mditLogger('debug', 'MarkdownRender Output:', renderedHtml);

  // 移除旧元素
  // originalSpanList
  //   .filter((e) => messageBox.hasChildNodes())
  //   .forEach((e) => {
  //     // do not remove formerly ignored elements
  //     if (e.classList.contains(markdownIgnoredPieceClassName)) {
  //       mditLogger('debug', 'Remove Ignore Triggered:', e);
  //       return;
  //     }
  //     messageBox.removeChild(e);
  //   });

  // // 将原有元素替换回内容
  // const markdownBody = document.createElement('div');
  // // some themes rely on this class to render
  // markdownBody.innerHTML = `<div class="text-normal">${renderedHtml}</div>`;
  // markPieces.filter((p) => (p?.replace !== undefined))
  //   .forEach((p) => {
  //     p.replace(markdownBody, p.id);
  //   });

  let markdownBody = messageBox;

  // Handle click of Copy Code Button
  addOnClickHandleForCopyButton(markdownBody);

  // Handle click of Copy Latex Button
  addOnClickHandleForLatexBlock(markdownBody);

  // Handle open external link
  handleExternalLink(markdownBody);

  // Add ShowOriginalContent button for this message.
  addShowOriginButtonToMarkdownBody(markdownBody, messageBox, msgBoxOriginalInnerHTML);
}

function _onLoad() {
  const plugin_path = LiteLoader.plugins.markdown_it.path.plugin;

  loadCSSFromURL(`local:///${plugin_path}/src/style/markdown.css`);
  loadCSSFromURL(`local:///${plugin_path}/src/style/katex.css`);
  loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github-dark.css`, 'github-hl-dark');
  loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github.css`, 'github-hl-adaptive');

  // Change fenced code block theme based on settings.
  let _ = useSettingsStore.subscribe(state => (state.codeHighligtThemeFollowSystem), (isFollowSystem) => {
    if (isFollowSystem) {
      loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github.css`, 'github-hl-adaptive');
    } else {
      loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github-dark.css`, 'github-hl-dark');
    }
  });


  // Observe the change of message list. Once changed, trigger render() function.
  const observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        // avoid error in render break users QQNT.
        try {
          debouncedRender();
        } catch (e) {
          ;
        }

      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Util function used in onLoad() to load local CSS.
 */
function loadCSSFromURL(url: string, id?: string) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  link.id = id;
  document.head.appendChild(link);
}

function onLoad() {
  try {
    mditLogger('debug', '[MarkdownIt] OnLoad() triggered');
    return _onLoad();
  } catch (e) {
    mditLogger('error', e);
  }
}

// 打开设置界面时触发
function onSettingWindowCreated(view: HTMLElement) {
  let root = (React as any).createRoot(view);
  root.render(<SettingPage></SettingPage>);
}

export {
  onSettingWindowCreated, onLoad,
}

