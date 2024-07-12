// 运行在 Electron 渲染进程 下的页面脚本
const { createRoot } = require("react-dom/client");
import React from 'react';
import { renderToString } from 'react-dom/server';

React.createRoot = createRoot;
import { SettingPage } from "./components/setting_page";
const hljs = require('highlight.js');
import markdownIt from 'markdown-it';
import katex from '@/lib/markdown-it-katex';

import { escapeHtml, purifyHtml, unescapeHtml } from '@/utils/htmlProc';

// Components
import {
    HighLightedCodeBlock,
    addOnClickHandleForCopyButton,
    renderInlineCodeBlockString,
    addOnClickHandleForLatexBlock,
    changeDirectionToColumnWhenLargerHeight
} from './components/code_block';

// States
import { useSettingsStore } from '@/states/settings';

// Utils
import { debounce } from 'throttle-debounce';
import { mditLogger, elementDebugLogger } from './utils/logger';
import { processorList } from '@/render/msgpiece_processor';

const markdownRenderedClassName = 'markdown-rendered';
const markdownIgnoredPieceClassName = 'mdit-ignored';
let markdownItIns = undefined;

onLoad();

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

        // 高亮函数，会返回转义的HTML。
        // 或 '' 如果源字符串未更改，则应在外部进行转义。
        // 如果结果以 <pre ... 开头，内部包装器则会跳过。
        highlight: function (str, lang) {
            return (renderToString(<HighLightedCodeBlock content={str} lang={lang} markdownItIns={localMarkdownItIns} />));
        },
    }).use(katex);
    localMarkdownItIns.renderer.rules.code_inline = renderInlineCodeBlockString;
    markdownItIns = localMarkdownItIns;
    return localMarkdownItIns;
}


const debouncedRender = debounce(
    50,
    render,
    { atBegin: false },
);

// 将所有 span 合并
// 并使用 markdown-it 渲染
function render() {
    // return;
    mditLogger('debug', 'renderer() triggered');

    const settings = useSettingsStore.getState();

    const elements = document.querySelectorAll(
        ".message-content"
    );

    let newlyFoundMsgList = Array.from(elements)
        // 跳过已渲染的消息
        .filter((messageBox) => (!messageBox.classList.contains(markdownRenderedClassName)))
        // 跳过空消息
        .filter((messageBox) => messageBox.childNodes.length > 0);

    mditLogger('debug', 'Newly found message count:', newlyFoundMsgList.length);

    for (let msgBox of newlyFoundMsgList) {
        try {
            renderSingleMsgBox(msgBox);
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
 * behaviour to all links inside rendered markdownBody.
 */
function handleExternalLink(markdownBody) {
    markdownBody.querySelectorAll("a").forEach((e) => {
        e.classList.add("markdown_it_link");
        e.classList.add("text-link");
        e.onclick = async (event) => {
            event.preventDefault();
            const href = event
                .composedPath()[0]
                .href.replace("app://./renderer/", "");
            await LiteLoader.api.openExternal(href);
            return false;
        };
    });
}

async function renderSingleMsgBox(messageBox) {
    const settings = useSettingsStore.getState();

    function renderedHtmlProcessor(x) {
        if ((settings.forceEnableHtmlPurify() ?? settings.enableHtmlPurify) == true) {
            mditLogger('debug', `Purify`, 'Input:', `${x}`);
            return purifyHtml(x);
        }
        return x;
    }

    if (messageBox.classList.contains(markdownRenderedClassName)) {
        return;
    }
    // 标记已渲染 markdown，防止重复执行导致性能损失
    messageBox.classList.add(markdownRenderedClassName);
    // Get all children of message box. Return if length is zero.
    const spanElem = Array.from(messageBox.children);
    mditLogger('debug', 'SpanElem:', spanElem);
    if (spanElem.length == 0) return;

    // 坐标位置，以备后续将 html 元素插入文档中
    const posBase = document.createElement('span')
    spanElem[0].before(posBase)

    // Here using entityProcess which may finally call DOMParser().parseFromString(input, "text/html");
    // This may introduce XSS attack vulnurability, however we will use DOMPurify to prevent all 
    // dangerous HTML elements when rendering rendered markdown.
    const markPieces = spanElem.map((msgPiece, index) => {
        mditLogger('debug', 'PieceProcessor', 'index:', index);
        mditLogger('debug', 'PieceProcessor', 'Original Piece:', msgPiece);
        let retInfo = undefined;

        // try apply pieces processor in order. Stop once a processor could process current msgPiece
        processorList.some(function (procFunc) {
            let funcRet = procFunc(msgPiece, index);
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
        .filter((e) => messageBox.hasChildNodes(e))
        .forEach((e) => {
            // do not remove formerly ignored elements.s
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

    // 在外部浏览器打开连接
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
    let _ = useSettingsStore.subscribe(
        state => (state.codeHighligtThemeFollowSystem),
        (isFollowSystem) => {
            if (isFollowSystem) {
                loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github.css`, 'github-hl-adaptive');
            }
            else {
                loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github-dark.css`, 'github-hl-dark');
            }
        });


    // Observe change of message list. Once changed, trigger render() function.
    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                // avoid error in render break users QQNT.
                try { debouncedRender(); }
                catch (e) {
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
function loadCSSFromURL(url, id) {
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
function onSettingWindowCreated(view) {
    let root = React.createRoot(view);
    root.render(<SettingPage></SettingPage>);
}

export {
    onSettingWindowCreated,
    onLoad,
}

