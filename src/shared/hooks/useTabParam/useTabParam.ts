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
     *
     */
    enabled?: boolean;
    /**
     *
     */
    tabs: string[];
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
    const { name = defaultParamName, fallbackValue, tabs, enabled = true } = params;

    const searchParams = useSearchParams();
    const initialValue = searchParams.get(name) ?? fallbackValue;
    const [activeTab, setActiveTab] = useState(initialValue);

    const updateActiveTab = useCallback(
        (tabId?: string, remove?: boolean) => {
            if (tabId == null) {
                return;
            }

            console.log('update', { tabId, enabled, name, remove });

            if (enabled) {
                updateSearchParams({ [name]: tabId }, remove);
            }

            setActiveTab(tabId);
        },
        [name, enabled],
    );

    // Initialize active tab on URL
    useEffect(() => updateActiveTab(initialValue), [initialValue, updateActiveTab]);

    // Remove tab parameter on URL when hook is unmounted
    useEffect(() => () => updateActiveTab('', true), [updateActiveTab]);

    const selectedTab = activeTab != null && tabs.includes(activeTab) ? activeTab : tabs[0];

    return [selectedTab, updateActiveTab];
};
