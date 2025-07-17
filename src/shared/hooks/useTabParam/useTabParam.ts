import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface IUseTabParamParams {
    /**
     * Name of the parameter to be used on the URL.
     * @default tab
     */
    name?: string;
    /**
     * Fallback value of the parameter used when URL has no initial parameter set.
     */
    fallbackValue?: string;
    /**
     * Updates the search parameters on the URL when set to true.
     * @default true
     */
    enableUrlUpdate?: boolean;
    /**
     * List of valid values for the active tab. When the value set on the URL is not included on this list, the active
     * tab is set to the first value of this array.
     */
    validTabs: string[];
}

export type IUseTabParamResult = [string | undefined, (tab: string) => void];

export const defaultParamName = 'tab';

// Using Next.js native history API to update the browser history without reloading the page
// (See https://nextjs.org/docs/app/getting-started/linking-and-navigating#native-history-api)
const updateSearchParams = (params: Record<string, string>, remove?: boolean) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.keys(params).forEach((key) => (remove ? newParams.delete(key) : newParams.set(key, params[key])));
    window.history.replaceState(null, '', `${window.location.pathname}?${newParams}`);
};

export const useTabParam = (params: IUseTabParamParams): IUseTabParamResult => {
    const { name = defaultParamName, fallbackValue, validTabs, enableUrlUpdate = true } = params;

    const searchParams = useSearchParams();

    const initialValue = searchParams.get(name) ?? fallbackValue;
    const [activeTab, setActiveTab] = useState(initialValue);

    const isValid = activeTab != null && validTabs.includes(activeTab);

    const updateActiveTab = useCallback(
        (tabId?: string, remove?: boolean) => {
            if (tabId == null) {
                return;
            }

            if (enableUrlUpdate) {
                updateSearchParams({ [name]: tabId }, remove);
            }

            setActiveTab(tabId);
        },
        [name, enableUrlUpdate],
    );

    // Update active tab on URL on fallbackValue change
    useEffect(() => updateActiveTab(initialValue), [initialValue, updateActiveTab]);

    // Remove tab parameter on URL when hook is unmounted
    useEffect(() => () => updateActiveTab('', true), [updateActiveTab]);

    const processedActiveTab = isValid ? activeTab : validTabs[0];

    return [processedActiveTab, updateActiveTab];
};
