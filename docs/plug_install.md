# 安装本插件

这里列出三种安装本插件的方法。

- 通过 [PluginInstaller](https://github.com/xinyihl/LiteLoaderQQNT-PluginInstaller/tree/main) 安装。（推荐）
- 通过下载 Release 中提供的ZIP压缩文件进行安装。
- 通过`git clone`直接克隆本项目。

# 通过 PluginInstaller 安装

> 正常情况下，推荐使用这种方式进行安装。

首先确保您已经安装PluginInstaller插件，并进入该插件设置页。

复制本项目`manifest.json`地址：

```plaintext
https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/blob/v4/manifest.json
```

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/fa2caddd-ef69-4cb3-8181-7f8ba4744a7f)

如图，将复制的链接粘贴到红色箭头处，点击确定即可。

# 通过 Release 提供的文件进行安装

进入本项目 [Relase](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/releases) 界面，在最新的 Release 中，下载名为 `Release.zip` 的文件。

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/d70c7a9f-4cef-430b-9886-bb726d7d7b26)


下载完成后，进入 LiteLoader 插件页，打开数据目录。

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/00ae01b8-856f-4b05-bcec-630d4f6f8c1c)

创建名为 `markdown-it` 的文件夹，并把下载好的 Release.zip 解压到新创建的文件夹中既可。

> 注意，解压时不要启用解压软件的 “解压到新文件夹中” 的选项。

# 克隆本项目

> 本方法仅推荐开发者使用。

首先使用 `git clone` 克隆本项目。然后在项目目录下运行以下命令：

```bash
npm install
npm run build
```

在这之后，项目文件夹便成为一个有效的本插件文件夹，同时你也可以进一步运行以下命令，生成与 Release 中相同的压缩包：

```bash
npm run release
```