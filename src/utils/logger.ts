/**
 * Contains util functions about logger.
 */

import { useSettingsStore } from '@/states/settings';

declare const markdown_it: {
    log: (consoleType: string, ...args: any[]) => any
};

type DistributiveFilter<Origin, Filter> = Origin extends Filter ? Origin : never;

/**
 * All functions member type of `console`.
 */
type LoggerFuncKey = {
    [K in keyof Console]: Console[K] extends (args: any) => any ? K : never;
}[keyof Console];

export type SupportedLoggerFuncKey = DistributiveFilter<LoggerFuncKey, 'debug' | 'log' | 'info' | 'warn' | 'error'>;

function outputToConsoleSettingEnabled() {
    return useSettingsStore.getState().consoleOutput;
}

function outputToFileSettingEnabled() {
    return useSettingsStore.getState().fileOutput;
}

export interface MditLoggerOptions {
    /**
     * Determine if a log will be output in DevTools console
     */
    consoleOutput: boolean;
    /**
     * Determine if a log will be persisted in file
     */
    fileOutput: boolean;
}

const defaultMditLoggerOptions: MditLoggerOptions = {
    consoleOutput: true,
    fileOutput: true,
}

export function mditLoggerGenerator(options: MditLoggerOptions = defaultMditLoggerOptions):
    (consoleFunction: SupportedLoggerFuncKey, ...params: any[]) => (undefined) {
    return function (consoleFunction: SupportedLoggerFuncKey, ...params: any[]) {
        if (outputToConsoleSettingEnabled() && options.consoleOutput) {
            console[consoleFunction](
                '%c [MarkdownIt] ',
                'background-color: rgba(0, 149, 204, 0.8); border-radius: 6px;padding-block: 2px; padding-inline: 0px; color: white;',
                ...params);
        }

        try {
            if (outputToFileSettingEnabled() && options.fileOutput) {

                let serializedParams = params.map((param) => {
                    if (typeof param !== 'string') {
                        return JSON.stringify(param);
                    }
                    return param;
                });

                markdown_it.log(consoleFunction, ...serializedParams);
            }
        } catch (e) {
            ;
        }

        return undefined;
    }
}

/**
 * Markdown it console output wrapper.
 * 
 * @param consoleFunction The name of the member function you want to use in `console`. For exmaple: `'debug'` or `'info'`
 * @param params Params that passed to `console` function.
 * 
 * @example 
 * 
 * ```js
 * mditLogger('debug', 'This is a debug message', {name: 'Jobs', age: 17});
 * ```
 */
export const mditLogger = mditLoggerGenerator();


const loggedClassName = '--mdit-debug-capture-element-logged';
const logFlagClassName = '--mdit-debug-capture-element';

export function elementDebugLogger() {
    var enabled = useSettingsStore.getState().enableElementCapture;
    if (!enabled) {
        return;
    }
    mditLogger('info', 'ElementCapture triggered');
    var codeEle = document.querySelectorAll('div.message-content__wrapper div.container--self code');

    // Add flag class for all marked --mdit-debug-capture-element
    Array.from(codeEle)
        .filter((ele) => ele.innerHTML == logFlagClassName)
        .forEach((ele) => {
            ele.classList.add(logFlagClassName);
        });

    // find all self sent message box that has been marked to capture, then log it.
    var flaggedMsgBoxs = document.querySelectorAll(`div.message-content__wrapper div.container--self:has(.${logFlagClassName})`);

    var loggedCount = 0;
    Array
        .from(flaggedMsgBoxs)
        .filter((ele) => !ele.classList.contains(loggedClassName)) // ensure one message box will only be logged one time
        .forEach((ele) => {
            // file-only logger
            mditLoggerGenerator({
                ...defaultMditLoggerOptions,
                consoleOutput: false,
            })('log', ele.outerHTML);

            mditLogger('debug', `Element captured: ${ele.tagName}`);

            ele.classList.add(loggedClassName);
            loggedCount++;
        });

    mditLogger('info', 'Element Capture Finished:', `${loggedCount} element(s) has been logged`);
}