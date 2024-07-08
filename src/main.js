// 运行在 Electron 主进程 下的插件入口
const { ipcMain } = require("electron");
import { generateMainProcessLogerWriter, LogPathHelper } from '@/utils/logger_main';

const loggerWriter = generateMainProcessLogerWriter();

function onBrowserWindowCreated() {
    try { onLoad(); } catch (e) {
        console.error('[markdown-it]', e);
    }
}

// 加载插件时触发
function onLoad() {

    ipcMain.handle('LiteLoader.markdown_it.log', (e, consoleMode, ...args) => {
        loggerWriter(consoleMode, ...args);
    });

    ipcMain.handle('LiteLoader.markdown_it.get_log_path', (e) => LogPathHelper.getLogFolderPath());
}

// 这两个函数都是可选的
export {
    onBrowserWindowCreated,
};
