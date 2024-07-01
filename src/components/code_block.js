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