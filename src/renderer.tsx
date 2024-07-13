// 运行在 Electron 渲染进程 下的页面脚本
const {createRoot} = require("react-dom/client");
import React from 'react';
import {renderToString} from 'react-dom/server';

(React as any).createRoot = createRoot;
import {SettingPage} from "./components/setting_page";

const hljs = require('highlight.js');
import markdownIt from 'markdown-it';
import katex from '@/lib/markdown-it-katex';

import {escapeHtml, purifyHtml, unescapeHtml} from '@/utils/htmlProc';

// Components
import {
  HighLightedCodeBlock,
  addOnClickHandleForCopyButton,
  renderInlineCodeBlockString,
  addOnClickHandleForLatexBlock,
  changeDirectionToColumnWhenLargerHeight
} from './components/code_block';

// States
import {useSettingsStore} from '@/states/settings';

// Utils
import {debounce} from 'throttle-debounce';
import {mditLogger, elementDebugLogger} from './utils/logger';
import {processorList} from '@/render/msgpiece_processor';

// Types
import {LiteLoaderInterFace} from '@/utils/liteloader_type';

declare const LiteLoader: LiteLoaderInterFace<Object>;
const markdownRenderedClassName = 'markdown-rendered';
const markdownIgnoredPieceClassName = 'mdit-ignored';
let markdownItIns: markdownIt | undefined = undefined;

onLoad();

/**
 * Function that generates a MarkdownIt instance based on user settings.
 */
function generateMarkdownIns() {
  const settings = useSettingsStore.getState();
  if (markdownItIns !== undefined) {
    return markdownItIns;
  }
  mditLogger('info', 'Generating new markdown-it renderer...');
  let localMarkdownItIns = markdownIt({
    html: true, // 在源码中启用 HTML 标签
    xhtmlOut: true, // 使用 '/' 来闭合单标签 （比如 <br />）。
    // 这个选项只对完全的 CommonMark 模式兼容。
    breaks: true, // 转换段落里的 '\n' 到 <br>。
    langPrefix: "language-", // 给围栏代码块的 CSS 语言前缀。对于额外的高亮代码非常有用。
    linkify: settings.linkify, // 将类似 URL 的文本自动转换为链接。

    // 启用一些语言中立的替换 + 引号美化
    typographer: settings.typographer,

    // 双 + 单引号替换对，当 typographer 启用时。
    // 或者智能引号等，可以是 String 或 Array。
    //
    // 比方说，你可以支持 '«»„“' 给俄罗斯人使用， '„“‚‘'  给德国人使用。
    // 还有 ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] 给法国人使用（包括 nbsp）。
    quotes: "“”‘’",

    // custom highlight UI renderer for markdown it.
    highlight: function (str, lang) {
      return (renderToString(<HighLightedCodeBlock content={str} lang={lang}
                                                   markdownItIns={localMarkdownItIns}/>));
    },
  }).use(katex);
  localMarkdownItIns.renderer.rules.code_inline = renderInlineCodeBlockString;
  markdownItIns = localMarkdownItIns;
  return localMarkdownItIns;
}


const debouncedRender = debounce(50, render, {atBegin: false},);

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

  // generate rendered HTML processor based on user config.
  function renderedHtmlProcessor(x: string) {
    if ((settings.forceEnableHtmlPurify() ?? settings.enableHtmlPurify) === true) {
      mditLogger('debug', `Purify`, 'Input:', `${x}`);
      return purifyHtml(x);
    }
    return x;
  }

  // For more info about Rendered class mark,
  // checkout: docs/dev/msg_rendering_process.md
  // skip rendered message
  if (messageBox.classList.contains(markdownRenderedClassName)) {
    return;
  }
  // mark the current message as rendered
  messageBox.classList.add(markdownRenderedClassName);

  // save original innerHTML for message box.
  let msgBoxOriginalInnerHTML = messageBox.innerHTML;

  // Get all children of message box. Return if length is zero.
  const spanElem = Array.from(messageBox.children);
  mditLogger('debug', 'renderSingleMsgBox', 'SpanElem:', spanElem);
  if (spanElem.length == 0) return;

  // used as pivot when we're inserting rendered elements later.
  const posBase = document.createElement('span')
  spanElem[0].before(posBase);

  // Here using entityProcess which may finally call DOMParser().parseFromString(input, "text/html");
  // This may introduce XSS attack vulnerability, however, we will use DOMPurify to prevent all
  // dangerous HTML elements when rendering markdown.
  const markPieces = spanElem.map((msgPiece, index) => {
    mditLogger('debug', 'PieceProcessor', 'index:', index);
    mditLogger('debug', 'PieceProcessor', 'Original Piece:', msgPiece);
    let retInfo = undefined;

    // Try to apply piece processor in order. Stop once a processor could process current msgPiece
    processorList.some(function (procFunc) {
      let funcRet = procFunc((msgPiece as HTMLElement), index);
      retInfo = funcRet;

      return retInfo !== undefined;
    });

    // if undefined, this element should be ignored and not be removed in later process.
    if (retInfo === undefined) {
      msgPiece.classList.add(markdownIgnoredPieceClassName);
    }
    mditLogger('debug', 'PieceProcessor', 'Piece processor return:', retInfo);
    return retInfo;
  });

  // 渲染 markdown
  const marks = markPieces.filter(p => p !== undefined).map((p) => p.mark).reduce((acc, p) => acc + p, "");
  mditLogger('debug', 'MarkdownRender Input:', marks);
  let renderedHtml = renderedHtmlProcessor(await generateMarkdownIns().render(marks));
  mditLogger('debug', 'MarkdownRender Output:', renderedHtml)

  // 移除旧元素
  spanElem
  .filter((e) => messageBox.hasChildNodes())
  .forEach((e) => {
    // do not remove formerly ignored elements
    if (e.classList.contains(markdownIgnoredPieceClassName)) {
      mditLogger('debug', 'Remove Ignore Triggered:', e);
      return;
    }
    messageBox.removeChild(e);
  });

  // 将原有元素替换回内容
  const markdownBody = document.createElement('div');
  // some themes rely on this class to render
  markdownBody.innerHTML = `<div class="text-normal">${renderedHtml}</div>`;
  markPieces.filter((p) => (p?.replace !== undefined))
  .forEach((p) => {
    p.replace(markdownBody, p.id);
  });

  // Handle click of Copy Code Button
  addOnClickHandleForCopyButton(markdownBody);

  // Handle click of Copy Latex Button
  addOnClickHandleForLatexBlock(markdownBody);

  // Handle open external link
  handleExternalLink(markdownBody);

  // 放回内容
  Array.from(markdownBody.childNodes)
  .forEach((elem) => {
    posBase.before(elem)
  })
  messageBox.removeChild(posBase);
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
  observer.observe(document.body, {childList: true, subtree: true});
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

