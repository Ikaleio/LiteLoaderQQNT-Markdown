import React from 'react';

import { useSettingsStore } from '@/states/settings';


export function SettingPage() {
    const settings = useSettingsStore(states => states);
    const updateSetting = useSettingsStore(states => states.updateSetting);

    // use encapsulated <DescriptionTile> and <SwitchSettingTile> whenever possible.
    return (<>

        <setting-section data-title='关于'>
            <setting-panel>
                <setting-list data-direction='column'>
                    <setting-item data-direction='row'>
                        <setting-text>设置更新</setting-text>
                        <setting-text data-type='secondary'>在此页面更新设置后，需要重启QQ后方可生效</setting-text>
                    </setting-item>

                </setting-list>
            </setting-panel>
        </setting-section>

        <setting-section data-title="基础设置">
            <setting-panel>
                <setting-list data-direction='column'>
                    <DescriptionTile
                        title='启用/停用 Markdown_it'
                        caption='请通过 "LiteLoaderQQNT -> 扩展" 管理页面启用或停用本插件'
                    />

                    {/* Linkify */}
                    <SwitchSettingTile
                        settingName='linkify'
                        title='Linkify'
                        caption='将可能是链接的内容自动格式化为链接格式' />

                    {/* typo */}
                    <SwitchSettingTile
                        settingName='typographer'
                        title='Typographer'
                        caption='语言书写相关以及引号的优化，如："你好" -> “你好”' />

                    <SwitchSettingTile
                        settingName='codeHighligtThemeFollowSystem'
                        title='代码高亮主题自适应'
                        caption='启用此选项后，浅色模式和深色模式下将自动套用对应的代码高亮背景，重启QQ后生效' />


                </setting-list>
            </setting-panel>
        </setting-section>


        <setting-section data-title="HTML渲染">
            <setting-panel>
                <setting-list data-direction='column'>

                    <SwitchSettingTile
                        settingName='unescapeAllHtmlEntites'
                        title='HTML渲染'
                        caption='反转义并渲染消息中的HTML标签。为保证安全性，本选项请务必与HTML净化同时开启。'
                    />

                    <SwitchSettingTile
                        settingName='enableHtmlPurify'
                        title='HTML净化'
                        caption='过滤不安全的HTML标签。' />

                </setting-list>
            </setting-panel>
        </setting-section>

        <setting-section data-title="开发者调试（请慎重修改此部分设置）">
            <setting-panel>
                <setting-list data-direction='column'>

                    <DescriptionTile title='SettingsState' caption={JSON.stringify(settings, undefined, ' ')} />

                    <SwitchSettingTile
                        settingName='consoleOutput'
                        title='控制台输出'
                        caption='关闭后，将屏蔽 MarkdownIt 插件向控制台输出的信息，目前仅能屏蔽部分信息。' />

                    <SwitchSettingTile
                        settingName='unescapeGtInText'
                        title='反转义消息字符中的">"符号'
                        caption='开启后，可正常显示 Blockquote 格式。' />

                    <SwitchSettingTile
                        settingName='unescapeBeforeHighlight'
                        title='反转义代码块内容'
                        caption='开启后，在Highlight.js高亮处理之前，先对代码块内容进行反转义，可保证代码块内 HTML Entites 的正常显示。
                        开启HTML渲染功能后，所有消息内的 HTML Entities 都会被反转义，故此选项自动关闭。' />

                </setting-list>
            </setting-panel>
        </setting-section>
    </>);
}

function SwitchSettingTile({ settingName, title, caption }) {
    const settings = useSettingsStore(states => states);
    const updateSetting = useSettingsStore(states => states.updateSetting);

    const getForceValue = (() => {
        var forceSettingName = 'force' + settingName.substr(0, 1).toUpperCase() + settingName.substr(1);
        return () => {
            try {
                return settings[forceSettingName]();
            } catch (e) {
                return undefined;
            }
        };
    })();

    const settingsValue = getForceValue() ?? settings[settingName];

    title ??= settingName;
    return (
        <setting-item>
            <TextAndCaptionBlock title={title} caption={caption} />

            <setting-switch data-direction='row'
                onClick={() => { updateSetting(settingName, !settings[settingName]) }}
                is-active={settingsValue == true ? true : undefined}
                is-disabled={getForceValue()}
            ></setting-switch>
        </setting-item>
    );
}

function DescriptionTile({ title, caption }) {
    return (
        <setting-item data-direction='row'>
            <TextAndCaptionBlock title={title} caption={caption} />
        </setting-item>
    );
}

function TextAndCaptionBlock({ title, caption }) {
    return (
        <div style={{
            'display': 'flex',
            'flexWrap': 'wrap',
            'flexDirection': 'column',
            'width': '92%',
        }}>
            <setting-text>{title}</setting-text>
            <setting-text
                data-type='secondary'
                style={{
                    // "text-wrap": "wrap",
                    'marginTop': '3px',
                    "wordBreak": "break-word"
                }}
            ><p style={{
                'overflowY': 'scroll',
            }}>{caption}</p></setting-text>
        </div>
    );
}