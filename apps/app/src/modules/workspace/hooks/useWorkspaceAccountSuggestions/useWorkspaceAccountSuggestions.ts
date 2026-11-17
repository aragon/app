'use client';

import { useEffect } from 'react';
import {
    type IWorkspaceAccountSuggestion,
    useWorkspaceAccountSuggestionList,
} from '../../api/workspaceQueryService';

export interface IUseWorkspaceAccountSuggestionsResult {
    /**
     * Suggested accounts, ranked: the ones the wallet deployed, then the others.
     */
    suggestions: IWorkspaceAccountSuggestion[];
    /**
     * Whether the list is still incomplete, i.e. a page is still being read.
     */
    isPending: boolean;
    /**
     * Whether a page could not be read; the pages after it are not read either.
     */
    isError: boolean;
}

const suggestionPageSize = 50;

/**
 * Accounts a wallet deployed or belongs to, suggested when adding accounts to a workspace. Reads every page, so the
 * list is complete before it is searched or an address is looked up against it.
 */
export const useWorkspaceAccountSuggestions = (
    walletAddress?: string,
): IUseWorkspaceAccountSuggestionsResult => {
    const isEnabled = walletAddress != null;

    const {
        data,
        isLoading,
        isError,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useWorkspaceAccountSuggestionList(
        {
            urlParams: { address: walletAddress ?? '' },
            queryParams: { pageSize: suggestionPageSize },
        },
        { enabled: isEnabled },
    );

    // Stops at a failed page, which would otherwise be fetched again in a loop.
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && !isError) {
            void fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

    if (!isEnabled) {
        return { suggestions: [], isPending: false, isError: false };
    }

    return {
        suggestions: data?.pages.flatMap((page) => page.data) ?? [],
        isPending: !isError && (isLoading || hasNextPage),
        isError,
    };
};
