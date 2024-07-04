import {
    createJSONStorage,
    StateStorage
} from 'zustand/middleware';


/**
 * The interface for QQNT Liteloader dev api.
 * 
 * Notice the `new_config` and `default_config` should all be a Object. Passing string will cause unexpected behaviour.
 */
interface LiteLoaderInterFace<T> {
    api: {
        config: {
            set(slug: string, new_config: T): Promise<T>;
            get(slug: string, default_config: T): Promise<T>;
        }
    }
};

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