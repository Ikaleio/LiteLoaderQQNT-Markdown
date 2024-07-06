/**
 * Contains util functions about logger.
 */

import { useSettingsStore } from '@/states/settings';

type DistributiveFilter<Origin, Filter> = Origin extends Filter ? Origin : never;

/**
 * All functions member type of `console`.
 */
type LoggerFuncKey = {
    [K in keyof Console]: Console[K] extends (args: any) => any ? K : never;
}[keyof Console];

export type SupportedLoggerFuncKey = DistributiveFilter<LoggerFuncKey, 'debug' | 'log' | 'info' | 'warn' | 'error'>;

function showOuputToConsole() {
    return useSettingsStore.getState().consoleOutput;
}

/**
 * Markdown it console output wrapper.
 * 
 * @param consoleFunction The function key of `console`. For exmaple: `'debug'`
 * @param params Params that passed to `console` function.
 * 
 * @example 
 * 
 * ```js
 * mditLogger('debug', 'This is a debug message');
 * ```
 */
export function mditLogger(consoleFunction: SupportedLoggerFuncKey, ...params: any[]) {
    if (!showOuputToConsole()) {
        return undefined;
    }
    return console[consoleFunction](
        '%c [MarkdownIt] ',
        'background-color: rgba(0, 149, 204, 0.8); border-radius: 6px;padding-block: 2px; padding-inline: 0px; color: white;',
        ...params);
}

