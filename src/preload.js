// Electron 主进程 与 渲染进程 交互的桥梁
const { contextBridge, ipcRenderer } = require("electron");

// 在window对象下导出只读对象
contextBridge.exposeInMainWorld("markdown_it", {
    // render: (content) =>
    //     ipcRenderer.invoke("LiteLoader.markdown_it.render", content),
    // open_link: (content) =>
    //     ipcRenderer.invoke("LiteLoader.markdown_it.open_link", content),
    // get_settings: (key) =>
    //     ipcRenderer.invoke("LiteLoader.markdown_it.get_settings", key),
    // update_settings: ({ name, value }) =>
    //     ipcRenderer.invoke("LiteLoader.markdown_it.update_settings", { name, value }),
    // remove_settings: (key) =>
    //     ipcRenderer.invoke("LiteLoader.markdown_it.remove_settings", key),
    log: (consoleType, ...args) => ipcRenderer.invoke('LiteLoader.markdown_it.log', consoleType, ...args),
    get_log_path: () => ipcRenderer.invoke('LiteLoader.markdown_it.get_log_path'),
});
