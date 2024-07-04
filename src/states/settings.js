import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';
import { LiteLoaderStorage } from '@/utils/liteloaderConfig';

// // Custom storage object, used by ipcRenderer zustand storage.
// const storage = {
//     getItem: async (name) => {
//         return (await markdown_it.get_settings(name)) || null
//     },
//     setItem: async (name, value) => {
//         await markdown_it.update_settings({ name, value });
//     },
//     removeItem: async (name) => {
//         await markdown_it.remove_settings(name);
//     },
// }

/**
 * forcefieldName() method is used to return the value indicating the setting  
 * `fieldName` is forced to that value despite the value stored in state.
 * Return `undefined` means repect values stored in states.
 * For example, when `unescapeAllHtmlEntites = true`, `forceEnableHtmlPurify()` 
 * should return `true` to make sure all HTML content be sanitized before rendering.
 */
export const useSettingsStore = create(
    persist(
        immer(subscribeWithSelector((set, get) => ({
            linkify: true,
            typographer: false,
            codeHighligtThemeFollowSystem: true,

            // HTML related
            unescapeAllHtmlEntites: false,
            enableHtmlPurify: false,

            // HTML escape settings
            unescapeGtInText: true,
            unescapeBeforeHighlight: true,

            forceUnescapeBeforeHighlight: () => {
                if (get().unescapeAllHtmlEntites === true) {
                    return false;
                }
                return undefined;
            },

            forceEnableHtmlPurify: () => {
                if (get().unescapeAllHtmlEntites === true) {
                    return true;
                }
                return undefined;
            },

            updateSetting: (key, value) => {
                set((state) => {
                    state[key] = value;
                })
            }
        }))),
        {
            name: 'state/settings',
            storage: LiteLoaderStorage,
        }
    ),
)