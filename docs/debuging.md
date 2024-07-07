部分情况下，您可能需要获取本插件的调试信息。

# 确保已开启调试输出

首先，请确保您已经开启本插件的调试信息输出功能，包括 控制台输出 以及 日志文件输出。

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/ca06d6e6-60b7-45c2-85bc-111b69bf47be)

## 开启元素抓取

部分情况下，开发者可能需要相关的元素调试信息来定位问题，您可以开启本插件设置中的 启用元素调试 功能。

启用该功能后，当您发送的消息包含：\`--mdit-debug-capture-element\` 时（需包含\`符号，该标志将会被渲染为`code`元素），该消息会被作为调试用消息进行抓取，并将相关信息保存到日志文件中。**在本功能启用时，请确保您发送的调试消息不包含任何您不想让其他人看到的敏感信息。**请看下例：

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/db4b29ee-1ec3-4c76-85ce-d5c2639ef254)

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/4dab43b9-6988-4f55-be0a-e84514e2e8f8)

为保证隐私性，只有自己发送的消息才能被标记为调试消息。


# 进入日志文件目录

首先进入 `LiteLoaderQQNT` 插件设置页面，进入数据目录。

![image](https://github.com/d0j1a1701/LiteLoaderQQNT-Markdown/assets/61616918/bbbae1b8-fdd1-4daa-848f-1ec654dc9407)

随后依次进入 `plugins -> markdown_it -> log`，便能看到所有日志文件。

> 如果目录不存在，一般是由于之前从未开启过日志文件输出功能。在完成上一步开启调试输出后，重启QQ即可。

# 提供文件给开发者

您可以直接将文件发送给相关的开发者，也可以选择用文本编辑工具打开 `.log` 文件并复制其内容进行分享。如果目录内存在多个文件，一般情况下请提供最新的文件。

# 清理日志文件

您可以在 `QQNT` 未启动的情况下，直接删除日志文件中的所有日志。