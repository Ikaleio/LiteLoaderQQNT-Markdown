import React from "react";
import hljs from 'highlight.js';

import { unescapeHtml, escapeHtml } from '@/utils/htmlProc';
import { useSettingsStore } from '@/states/settings';

export function HighLightedCodeBlock({ content, lang, markdownItIns }) {

    if (!lang || !hljs.getLanguage(lang)) {
        lang = 'plaintext';
    }

    console.debug(`[Markdown-it] Inside Fenced Code, unescapeBeforeHighlight=${useSettingsStore.getState().unescapeBeforeHighlight}`);

    function contentPreprocess(input) {

        // if unescapeAll has enabled, unescape code content again may cause display error
        // so here we should force skip unescape process and ignore user settings.
        if (useSettingsStore.getState().forceUnescapeBeforeHighlight() === false) {
            return input;
        }

        if (useSettingsStore.getState().unescapeBeforeHighlight === true) {
            return unescapeHtml(input);
        }

        return input;
    }

    var Finalcontent = "";
    try {
        Finalcontent = hljs.highlight(contentPreprocess(content), { language: lang, ignoreIllegals: true }).value;
    } catch (e) {
        console.debug(`[Markdown-it] hljs error: ${e}`);
    }

    return (<pre className='hljs hl-code-block'>
        <button className='lang_copy'>
            <p className='lang'>{lang}</p>
            <p className='copy'>复制</p>
        </button>
        <code dangerouslySetInnerHTML={{ __html: Finalcontent }}></code>
    </pre>);
}

export function renderInlineCodeBlockString(tokens, idx, options, env, slf) {
    var token = tokens[idx];

    if (useSettingsStore.getState().unescapeAllHtmlEntites === true) {
        console.debug(`[Markdown-it] Inside Inline Render: escape=true`);
        token.content = escapeHtml(token.content);
    }
    console.debug(`[Markdown-it] Inside Inline Render: escape=false`);


    return '<code' + slf.renderAttrs(token) + '>' +
        token.content +
        '</code>';
}

/**
 * Find all Copy Button and add click handler to it. Will directly mutate the received 
 * HTML element.
 * 
 * @param {HTMLElement} element 
 */
export function addOnClickHandleForCopyButton(element) {
    var buttons = element.querySelectorAll('pre.hl-code-block>button.lang_copy');
    Array.from(buttons)
        .forEach(function (copyButton) {
            try {
                // get content of this code block
                var codeContent = copyButton.parentElement.querySelector('code').textContent;
                copyButton.onclick = () => { navigator.clipboard.writeText(codeContent) };
            } catch (e) {
                ;
            }
        });
}

/**
 * Find all Copy Button of Latex block and add hanlder to it.
 * 
 * @param {HTMLElement} element 
 */
export function addOnClickHandleForLatexBlock(element) {
    var buttons = element.querySelectorAll('div.katex-block-rendered>button.copy_latex');


    Array.from(buttons)
        .forEach(function (copyButton) {
            try {
                // find tex annotation
                var latexAnno = copyButton.parentElement.querySelector('annotation[encoding="application/x-tex"]').textContent;
                copyButton.onclick = () => { navigator.clipboard.writeText(latexAnno) };
            } catch (e) {
                ;
            }
        });
}