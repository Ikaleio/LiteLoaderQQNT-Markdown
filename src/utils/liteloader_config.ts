import {
    createJSONStorage,
    StateStorage
} from 'zustand/middleware';

import { LiteLoaderInterFace } from '@/utils/liteloader_type';

declare const LiteLoader: LiteLoaderInterFace<Object>;

const pluginSlugPrefix = 'markdown-it';
const emptyStorageState = {};


const _storage = {
    async getItem(name: string) {
        return JSON.stringify(
            await LiteLoader.api.config.get(`${pluginSlugPrefix}-${name}`, emptyStorageState)
        );
    },
    async setItem(name: string, value: string) {
        return await LiteLoader.api.config.set(`${pluginSlugPrefix}-${name}`, JSON.parse(value));
    },
    async removeItem(name: string) {
        return await LiteLoader.api.config.set(pluginSlugPrefix, emptyStorageState);
    }
}

export const LiteLoaderStorage = createJSONStorage(() => _storage);