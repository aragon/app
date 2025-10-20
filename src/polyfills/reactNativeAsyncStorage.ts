const store = new Map<string, string>();

type NullableString = string | null;

const getValue = (key: string): NullableString => (store.has(key) ? store.get(key)! : null);

const AsyncStorage = {
    getItem: (key: string): Promise<NullableString> => Promise.resolve(getValue(key)),
    setItem: (key: string, value: string): Promise<void> => {
        store.set(key, value);
        return Promise.resolve();
    },
    removeItem: (key: string): Promise<void> => {
        store.delete(key);
        return Promise.resolve();
    },
    clear: (): Promise<void> => {
        store.clear();
        return Promise.resolve();
    },
    getAllKeys: (): Promise<string[]> => Promise.resolve(Array.from(store.keys())),
    multiGet: (keys: string[]): Promise<Array<[string, NullableString]>> =>
        Promise.resolve(keys.map((key) => [key, getValue(key)] as [string, NullableString])),
    multiSet: (entries: Array<[string, string]>): Promise<void> => {
        entries.forEach(([key, value]) => {
            store.set(key, value);
        });
        return Promise.resolve();
    },
    multiRemove: (keys: string[]): Promise<void> => {
        keys.forEach((key) => store.delete(key));
        return Promise.resolve();
    },
};

export const useAsyncStorage = (key: string) => ({
    getItem: () => AsyncStorage.getItem(key),
    setItem: (value: string) => AsyncStorage.setItem(key, value),
    removeItem: () => AsyncStorage.removeItem(key),
});

export default AsyncStorage;
export { AsyncStorage };
