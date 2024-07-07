/**
 * The interface for QQNT Liteloader dev api.
 * 
 * Notice the `new_config` and `default_config` should all be a Object. Passing string will cause unexpected behaviour.
 */

export interface LiteLoaderInterFace<ConfigInfoType> {
    path: {
        root: string;    // 本体目录路径
        profile: string; // 存储目录路径（如果指定了 LITELOADERQQNT_PROFILE 环境变量）
        data: string;    // 数据目录路径
        plugins: string; // 插件目录路径
    };
    versions: {
        qqnt: string;       // QQNT 版本号
        liteloader: string; // LiteLoaderQQNT 版本号
        node: string;       // Node.js 版本号
        chrome: string;     // Chrome 版本号
        electron: string;   // Electron 版本号
    };
    os: {
        platform: string; // 系统平台名称
    };
    package: {
        liteloader: object; // LiteLoaderQQNT package.json 文件内容
        qqnt: object;       // QQNT package.json 文件内容
    };
    plugins: {
        markdown_it: {
            incompatible: boolean;   // 插件是否兼容
            disabled: boolean;       // 插件是否禁用
            manifest: object;        // 插件 manifest.json 文件内容
            path: {
                plugin: string;  // 插件本体根目录路径
                data: string;    // 插件数据根目录路径
                injects: {
                    main: string;      // 插件主进程脚本文件路径
                    renderer: string;  // 插件渲染进程脚本文件路径
                    preload: string;   // 插件预加载脚本文件路径
                };
            };
        };
    };
    api: {
        openPath(path: string): void;         // 打开指定目录
        openExternal(uri: string): void;      // 打开外部连接
        config: {
            set(slug: string, newConfig: ConfigInfoType): Promise<ConfigInfoType>;       // 设置配置文件
            get(slug: string, defaultConfig: ConfigInfoType): Promise<ConfigInfoType>; // 获取配置文件
        };
    };
}
