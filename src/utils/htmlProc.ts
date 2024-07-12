// Utils function about HTML string process

import { mditLogger } from "./logger";

const DOMPurify = require('DOMPurify');
// import {} from 'dompurify';

DOMPurify.addHook('uponSanitizeElement', function (node: HTMLElement, data: any) {
    // mditLogger('debug', 'PurifyHook', 'Data', data);
    if (data.allowedTags[data.tagName] === true) {
        // mditLogger('debug', 'PurifyHook', 'Hook skipped');
        return;
    }
    let newNode = document.createElement('p');
    newNode.innerText = node.outerHTML;
    // mditLogger('debug', 'PurifyHook', 'New node', newNode);
    node.replaceWith(newNode);
});

interface UponSanitizeDataRecv {
    tagName: string;
    allowedTags: Record<string, boolean>;
}

/**
 * Unescape HTML entities in HTML string. Already unescaped HTML tag string will be ignored and not shown 
 * in return string.
 * @param {string} input 
 * @returns {string} String with all HTML entities unescaped
 */
export function unescapeHtml(input: string) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}

export function escapeHtml(input: string) {
    return input
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/**
 * Using DOMPurify to purify HTML
 * @param {string} input 
 * @return {string} Purified HTML string.
 */
export function purifyHtml(input: string) {
    let res = DOMPurify.sanitize(input);
    mditLogger('debug', 'Purify', 'Removed', DOMPurify.removed);
    return res;
}