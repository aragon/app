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

    const processedActiveFilter = isValid ? activeFilter : validValues?.[0];

    // Read as booleans because `validValues` is rebuilt on every render, which would otherwise rewrite the URL on
    // every render too. Unknown is not the same as none: undefined means they have not loaded yet.
    const areValidValuesKnown = validValues != null;
    const hasValidValues = validValues != null && validValues.length > 0;

    // Keep the URL on the value actually in use, which is not always the one it carries: a value that is not valid
    // here falls back to the first one, and leaving the original behind would name a filter that is not the one
    // being displayed. That happens whenever the valid values change under a mounted filter — a workspace
    // switching the account of its proposal list, whose bodies belong to the DAO that was selected before.
    //
    // Having none at all is the other half of it: an account with no process has no body to fall back to, so the
    // parameter is dropped rather than left naming a body of the account before it.

    useEffect(() => {
        if (!areValidValuesKnown) {
            return;
        }

        if (hasValidValues) {
            updateActiveFilter(processedActiveFilter);

            return;
        }

        updateActiveFilter('', true);
    }, [
        areValidValuesKnown,
        hasValidValues,
        processedActiveFilter,
        updateActiveFilter,
    ]);

    // Remove tab parameter on URL when hook is unmounted
    useEffect(() => () => updateActiveFilter('', true), [updateActiveFilter]);

    return [processedActiveFilter, updateActiveFilter];
};
