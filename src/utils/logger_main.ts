import * as path from 'path';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { writeFile } from 'fs/promises';
import { LiteLoaderInterFace } from '@/utils/liteloader_type';

declare const LiteLoader: LiteLoaderInterFace<Object>;

export function generateMainProcessLogerWriter() {
    var startTimeStr: string = new Date().toISOString();
    startTimeStr = startTimeStr.replaceAll(':', '-');
    var logFolderPath = path.join(LiteLoader.plugins.markdown_it.path.plugin, 'log');
    var logFilePath = path.join(LiteLoader.plugins.markdown_it.path.plugin, 'log', `${startTimeStr}.log`);
    console.log(`[markdown-it] logFolderPath: ${logFolderPath}`);
    console.log(`[markdown-it] logFilePath: ${logFilePath}`);

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
                return str + value;
            }
            return str + JSON.stringify(value);
        }, '');

        var logStr = `${consoleMode.toUpperCase()} | ${timeStr} | ${argsStr}`;
        stream.write(`${logStr}\n`);
        try {
        } catch (e) {
            console.log(`[markdown-it] Log file failed to update`, e);
        }
    }
}