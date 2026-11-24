'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
    type IWorkspaceAccountSuggestion,
    useWorkspaceAccountSuggestionList,
    workspaceQueryServiceKeys,
} from '../../api/workspaceQueryService';

export interface IUseWorkspaceAccountSuggestionsResult {
    /**
     * Suggested accounts, ranked: the ones the wallet deployed, then the others.
     */
    suggestions: IWorkspaceAccountSuggestion[];
    /**
     * Whether a page is still being read.
     */
    isPending: boolean;
    /**
     * Whether a page could not be read; the pages after it are not read either.
     */
    isError: boolean;
    /**
     * Whether a source could not be read, so accounts may be missing.
     */
    isIncomplete: boolean;
    /**
     * Reads the list again, pending as on the first load.
     */
    refetch: () => void;
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
    const queryClient = useQueryClient();
    const params = {
        urlParams: { address: walletAddress ?? '' },
        queryParams: { pageSize: suggestionPageSize },
    };

    const {
        data,
        isLoading,
        isError,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
    } = useWorkspaceAccountSuggestionList(params, { enabled: isEnabled });

    // Stops at a failed page, which would otherwise be fetched again in a loop. Every mounted instance runs this in the
    // same commit, so later calls join the running read instead of cancelling it.
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && !isError) {
            void fetchNextPage({ cancelRefetch: false });
        }
    }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

    if (!isEnabled) {
        return {
            suggestions: [],
            isPending: false,
            isError: false,
            isIncomplete: false,
            refetch: () => undefined,
        };
    }

    return {
        suggestions: data?.pages.flatMap((page) => page.data) ?? [],
        isPending: !isError && (isLoading || hasNextPage),
        isError,
        isIncomplete: data?.pages.some((page) => page.isIncomplete) ?? false,
        refetch: () =>
            void queryClient.resetQueries({
                queryKey: workspaceQueryServiceKeys.accountSuggestions(params),
            }),
    };
};
