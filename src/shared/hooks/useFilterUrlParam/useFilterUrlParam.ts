import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface IUseFilterUrlParamParams {
    /**
     * Name of the filter parameter to be used on the URL.
     * @default filter
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
     * List of valid values for the active filter. When the value set on the URL is not included on this list, the
     * active filter is set to the first value of this array.
     */
    validValues?: string[];
}

export type IUseFilterUrlParamResult = [
    string | undefined,
    (tab: string) => void,
];

export const defaultFilterParam = 'filter';

// Using Next.js native history API to update the browser history without reloading the page
// (See https://nextjs.org/docs/app/getting-started/linking-and-navigating#native-history-api)
const updateSearchParams = (
    params: Record<string, string>,
    remove?: boolean,
) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.keys(params).forEach((key) =>
        remove ? newParams.delete(key) : newParams.set(key, params[key]),
    );
    window.history.replaceState(
        null,
        '',
        `${window.location.pathname}?${newParams}`,
    );
};

export const useFilterUrlParam = (
    params: IUseFilterUrlParamParams,
): IUseFilterUrlParamResult => {
    const {
        name = defaultFilterParam,
        fallbackValue,
        validValues,
        enableUrlUpdate = true,
    } = params;

    const searchParams = useSearchParams();

    const initialValue = searchParams.get(name) ?? fallbackValue;
    const [activeFilter, setActiveFilter] = useState(initialValue);

    const isValid = activeFilter != null && validValues?.includes(activeFilter);

    const updateActiveFilter = useCallback(
        (tabId?: string, remove?: boolean) => {
            if (tabId == null) {
                return;
            }

            if (enableUrlUpdate) {
                updateSearchParams({ [name]: tabId }, remove);
            }

            setActiveFilter(tabId);
        },
        [name, enableUrlUpdate],
    );

    // Update active tab on URL on fallbackValue change
    useEffect(
        () => updateActiveFilter(initialValue),
        [initialValue, updateActiveFilter],
    );

    // Remove tab parameter on URL when hook is unmounted
    useEffect(() => () => updateActiveFilter('', true), [updateActiveFilter]);

    const processedActiveFilter = isValid ? activeFilter : validValues?.[0];

    return [processedActiveFilter, updateActiveFilter];
};
