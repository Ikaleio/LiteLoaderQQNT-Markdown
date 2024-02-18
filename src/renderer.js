// 运行在 Electron 渲染进程 下的页面脚本

// 使用 markdown-it 渲染每个span标记的内容
function render() {
    const elements = document.querySelectorAll(
        ".message-content > span > span"
    );
    elements.forEach(async (element) => {
        // 特判 @
        if (element.className.includes("text-element--at")) return;
        // 将 QQ 默认生成的 link 合并到 上一个 span 中
        if (element.nextElementSibling && element.nextElementSibling.className && element.nextElementSibling.className.includes("text-link")) {
            element.textContent += element.nextElementSibling.textContent;
            element.parentNode.removeChild(element.nextElementSibling);
        }
        const renderedHTML = await markdown_it.render(element.textContent);
        const tempElement = document.createElement("div");
        tempElement.classList.add('markdown-body');
        tempElement.innerHTML = renderedHTML;
        var elements = tempElement.querySelectorAll("a");
        elements.forEach((e) => {
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
        });
        element.replaceWith(...tempElement.childNodes);
    });
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
