// 运行在 Electron 渲染进程 下的页面脚本


// 将所有 span 合并
// 并使用 markdown-it 渲染
function render() {
    const elements = document.querySelectorAll(
        ".message-content"
    );

    Array.from(elements)
        // 跳过已渲染的消息
        .filter((messageBox) => !messageBox.classList.contains('markdown-rendered'))
        // 跳过空消息
        .filter((messageBox) => messageBox.childNodes.length > 0)
        .forEach(async (messageBox) => {
            // 标记已渲染 markdown，防止重复执行导致性能损失
            messageBox.classList.add('markdown-rendered')

            // 消息都在 span 里
            const spanElem = Array.from(messageBox.childNodes)
                .filter((e) => e.tagName == 'SPAN')

            if (spanElem.length == 0) return

            // 坐标位置，以备后续将 html 元素插入文档中
            const posBase = document.createElement('span')
            spanElem[0].before(posBase)

            // 对于纯文本，应该拿出 innerHTML。这不会发生 XSS 注入，因为 QQ 自身已经进行了转义
            // 对于表情，at 信息等消息，生成占位标签，并在结束后使用原元素进行替换（避免markdownit渲染内容）
            const markPieces = spanElem.map((msgPiece, index) => {
                if (msgPiece.className.includes("text-element") && !msgPiece.querySelector('.text-element--at')) {
                    return {
                        mark: Array.from(msgPiece.getElementsByTagName("span"))
                            .map((e) => e.innerHTML)
                            .reduce((acc, x) => acc + x, ""),
                        replace: null
                    }
                } else {
                    const id = "placeholder-" + index
                    return {
                        mark: `<span id="${id}"></span>`,
                        replace: (parent) => {
                            const oldNode = parent.querySelector(`#${id}`)
                            oldNode.replaceWith(msgPiece)
                        }
                    }
                }
            })

            // 渲染 markdown
            const marks = markPieces.map((p) => p.mark).reduce((acc, p) => acc + p, "")
            const renderedHtml = await markdown_it.render(marks)

            // 移除旧元素
            spanElem
                .filter((e) => messageBox.hasChildNodes(e))
                .forEach((e) => {
                    messageBox.removeChild(e)
                })
            
            // 将原有元素替换回内容
            const markdownBody = document.createElement('div')
            markdownBody.innerHTML = renderedHtml
            markPieces.filter((p) => p.replace != null)
                .forEach((p) => {
                    p.replace(markdownBody)
                })

            // 在外部浏览器打开连接
            markdownBody.querySelectorAll("a").forEach((e) => {
                e.classList.add("markdown_it_link");
                e.classList.add("text-link");
                e.onclick = async (event) => {
                    event.preventDefault();
                    const href = event
                        .composedPath()[0]
                        .href.replace("app://./renderer/", "");
                    await markdown_it.open_link(href);
                    return false;
                };
            })

            // 放回内容
            Array.from(markdownBody.childNodes)
                .forEach((elem) => {
                    posBase.before(elem)
                })
            messageBox.removeChild(posBase)

        })

}

function loadCSSFromURL(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
}

onLoad();

function onLoad() {
    const plugin_path = LiteLoader.plugins.markdown_it.path.plugin;

    loadCSSFromURL(`local:///${plugin_path}/src/style/markdown.css`);
    loadCSSFromURL(`local:///${plugin_path}/src/style/hljs-github-dark.css`);
    loadCSSFromURL(`local:///${plugin_path}/src/style/katex.css`);

    const observer = new MutationObserver((mutationsList) => {
        for (let mutation of mutationsList) {
            if (mutation.type === "childList") {
                render();
            }
        }
    });

    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);
}

// 打开设置界面时触发
function onSettingWindowCreated(view) { }

// export { onLoad };
