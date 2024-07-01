import React from "react";
import hljs from 'highlight.js';

import { unescapeHtml, escapeHtml } from '@/utils/htmlProc';
import { useSettingsStore } from '@/states/settings';

export function HighLightedCodeBlock({ content, lang, markdownItIns }) {
    if (!lang || !hljs.getLanguage(lang)) {
        lang = 'plaintext';
    }

    const settings = useSettingsStore((state) => state)

    function contentPreprocess(input) {

        // if unescapeAll has enabled, unescape code content again may cause display error
        // so here we should force skip unescape process and ignore user settings.
        if (settings.forceUnescapeBeforeHighlight() === false) {
            return input;
        }

        if (settings.unescapeBeforeHighlight === true) {
            return unescapeHtml(input);
        }

        return input;
    }

    var Finalcontent = "";
    try {
        Finalcontent = hljs.highlight(contentPreprocess(content), { language: lang, ignoreIllegals: true }).value;
    } catch (e) { }

    return (<pre className='hljs hl-code-block'>
        <code dangerouslySetInnerHTML={{ __html: Finalcontent }}></code>
    </pre>);
}

export function renderInlineCodeBlockString(tokens, idx, slf) {

    const settings = useSettingsStore((state) => state);

    function contentPreprocess(input) {

        if (settings.unescapeAllHtmlEntites === true) {
            return escapeHtml(input);
        }

        return input;
    }

    const token = tokens[idx]
    return '<code' + slf.renderAttrs(token) + '>' +
        contentPreprocess(token.content) +
        '</code>';
}