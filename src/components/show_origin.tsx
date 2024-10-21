import React from 'react';
import {mditLogger} from "@/utils/logger";
import {createRoot} from "react-dom/client";
import {useSettingsStore} from "@/states/settings";

export interface ShowOriginalContentButtonProps {
    msgBox: HTMLElement;
    originalInnerHTML: string;
    renderedInnerHTML: string;
}

export function ShowOriginalContentButton(props: ShowOriginalContentButtonProps) {
    return (
        <>
            <button
                className='mdit-show-origin-button'
                onClick={function () {
                    mditLogger('info', 'ShowOriginalContent', 'Button clicked');
                    try {
                        props.msgBox.innerHTML = props.originalInnerHTML;
                    } catch (e) {
                        mditLogger('debug', 'ShowOriginalContent', 'Content replaced failed', props.originalInnerHTML);
                        mditLogger('error', e);
                    }
                }}><p>Show Original</p>
            </button>
        </>
    );
}

/**
 * Function used to add a "Show Original Content" button to a markdownBody. Works with render()
 *
 * This function will respect user config. Will skip adding button if user config not to enable this feature.
 */
export function addShowOriginButtonToMarkdownBody(markdownBody: HTMLElement, msgBox: HTMLElement, originalInnerHTML: string) {
    if (useSettingsStore.getState().showOriginalButton === false) {
        return;
    }

    let _showOriginalButton = document.createElement('div');
    let showOriginalButton = createRoot(_showOriginalButton);
    showOriginalButton.render(<ShowOriginalContentButton
        msgBox={msgBox}
        originalInnerHTML={originalInnerHTML}
        renderedInnerHTML={''}/>);
    markdownBody.appendChild(_showOriginalButton);
}