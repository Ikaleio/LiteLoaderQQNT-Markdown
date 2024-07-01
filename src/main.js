// 运行在 Electron 主进程 下的插件入口
const { shell, ipcMain } = require("electron");
const fs = require('fs/promises');

const plugin_path = LiteLoader.plugins["markdown_it"].path.plugin;

// import { shell, ipcMain } from "electron";

const setttingsJsonFilePath = `${plugin_path}/settings.json`;

async function getSettings(key) {
    var json = JSON.parse(await fs.readFile(setttingsJsonFilePath));
    return json[key];
}

async function updateSettings({ name, value }) {
    var json = {};
    try { json = JSON.parse(await fs.readFile(setttingsJsonFilePath)); } catch (e) {
        ;
    }
    json[name] = value;
    await fs.writeFile(setttingsJsonFilePath, JSON.stringify(json));
}

async function removeSettings(key) {
    var json = JSON.parse(await fs.readFile(setttingsJsonFilePath));
    json[key] = undefined;
    await fs.writeFile(setttingsJsonFilePath, JSON.stringify(json));
}

onLoad();

// 加载插件时触发
function onLoad() {
    ipcMain.handle("LiteLoader.markdown_it.open_link", (event, content) => {
        if (content.indexOf("http") != 0) {
            content = "http://" + content;
        }
        return shell.openExternal(content);
    });

    ipcMain.handle('LiteLoader.markdown_it.get_settings', (e, key) => {
        return getSettings(key);
    });

    ipcMain.handle('LiteLoader.markdown_it.update_settings', (e, { name, value }) => {
        return updateSettings({ name, value });
    });

    ipcMain.handle('LiteLoader.markdown_it.remove_settings', (e, key) => {
        return removeSettings(key);
    })
}

// 这两个函数都是可选的
module.exports = {
    onLoad,
};
