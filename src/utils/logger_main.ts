import * as path from 'path';
import { existsSync, mkdirSync, rmSync, createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { LiteLoaderInterFace } from '@/utils/liteloader_type';

declare const LiteLoader: LiteLoaderInterFace<Object>;

export const LogPathHelper = {
    getLogFolderPath() {
        return path.join(LiteLoader.plugins.markdown_it.path.plugin, 'log');
    },

    /**
     * Get absolute file path of a log file.
     * 
     * @param logFileName Name of the log file. If `undefined`, 
     * will generate automatically based on current time.
     */
    getLogFilePath(logFileName?: string | undefined) {
        // generate log file name if not received
        logFileName ??= (new Date().toISOString()).replaceAll(':', '-');

        return path.join(LiteLoader.plugins.markdown_it.path.plugin, 'log', `${logFileName}.log`);
    }
};

/**
 * Generate a writer function that used to write log into log file.
 */
export function generateMainProcessLogerWriter() {
    var logFolderPath = LogPathHelper.getLogFolderPath();
    var logFilePath = LogPathHelper.getLogFilePath();

    console.log(`[markdown-it] logFolderPath: ${logFolderPath}`);
    console.log(`[markdown-it] logFilePath: ${logFilePath}`);

    // clear former log file
    rmSync(logFolderPath, { recursive: true });

    // create dir if not exists
    try {
        if (!existsSync(logFolderPath)) {
            mkdirSync(logFolderPath, { recursive: true });
        }
    } catch (err) {
        console.error(err);
    }

    var stream = createWriteStream(logFilePath, {
        flags: 'a+',
    })

    return async function (consoleMode: string, ...args: any[]) {
        var timeStr = new Date().toISOString();

        var argsStr = args.reduce(function (str, value) {
            if (typeof value === 'string') {
                return str + value + ' ';
            }
            return str + JSON.stringify(value) + ' ';
        }, '');

        var logStr = `${consoleMode.toUpperCase()} | ${timeStr} | ${argsStr}`;
        stream.write(`${logStr}\n`);
    }
}