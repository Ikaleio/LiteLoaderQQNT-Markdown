/**
 * The interface for QQNT Liteloader dev api.
 * 
 * Notice the `new_config` and `default_config` should all be a Object. Passing string will cause unexpected behaviour.
 */
export interface LiteLoaderInterFace<T> {
    api: {
        openPath(path: string): any;
        openExternal(uri: string): any;
        config: {
            set(slug: string, new_config: T): Promise<T>;
            get(slug: string, default_config: T): Promise<T>;
        }
    },
};