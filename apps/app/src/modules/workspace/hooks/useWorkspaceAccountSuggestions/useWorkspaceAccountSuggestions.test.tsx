import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IWorkspaceAccountSuggestion,
    WorkspaceAccountSuggestionRole,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import { WorkspaceAccountType } from '../../api/workspaceService';
import { useWorkspaceAccountSuggestions } from './useWorkspaceAccountSuggestions';

describe('useWorkspaceAccountSuggestions hook', () => {
    const wallet = '0x5dcD623bf6E792bfBDbf8d643f6478153df4A8D2';

    const getAccountSuggestionsSpy = jest.spyOn(
        workspaceQueryService,
        'getAccountSuggestions',
    );

    const buildSuggestion = (address: string): IWorkspaceAccountSuggestion => ({
        account: {
            id: `${Network.ETHEREUM_MAINNET}-${address}`,
            type: WorkspaceAccountType.DAO,
            address,
            network: Network.ETHEREUM_MAINNET,
        },
        role: WorkspaceAccountSuggestionRole.MEMBER,
    });

    const first = buildSuggestion('0x23A16064466201bfB2b096B68c5103B70Da78394');
    const second = buildSuggestion(
        '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
    );

    afterEach(() => {
        getAccountSuggestionsSpy.mockReset();
    });

    const renderSuggestions = (address?: string) =>
        renderHook(() => useWorkspaceAccountSuggestions(address), {
            wrapper: ReactQueryWrapper,
        });

    it('suggests nothing without a connected wallet', () => {
        const { result } = renderSuggestions(undefined);

        expect(result.current).toEqual({
            suggestions: [],
            isPending: false,
            isError: false,
        });
        expect(getAccountSuggestionsSpy).not.toHaveBeenCalled();
    });

    it('reads every page of the suggestions before the list is complete', async () => {
        getAccountSuggestionsSpy
            .mockResolvedValueOnce({
                data: [first],
                metadata: {
                    page: 1,
                    pageSize: 1,
                    totalPages: 2,
                    totalRecords: 2,
                },
            })
            .mockResolvedValueOnce({
                data: [second],
                metadata: {
                    page: 2,
                    pageSize: 1,
                    totalPages: 2,
                    totalRecords: 2,
                },
            });
        const { result } = renderSuggestions(wallet);

        expect(result.current.isPending).toBe(true);
        await waitFor(() => expect(result.current.isPending).toBe(false));

        expect(result.current.suggestions).toEqual([first, second]);
        expect(getAccountSuggestionsSpy).toHaveBeenLastCalledWith(
            expect.objectContaining({
                urlParams: { address: wallet },
                queryParams: expect.objectContaining({ page: 2 }),
            }),
        );
    });

    it('stops at a page that fails and reports the error', async () => {
        getAccountSuggestionsSpy
            .mockResolvedValueOnce({
                data: [first],
                metadata: {
                    page: 1,
                    pageSize: 1,
                    totalPages: 2,
                    totalRecords: 2,
                },
            })
            .mockRejectedValue(new Error('error'));
        const client = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });
        const { result } = renderHook(
            () => useWorkspaceAccountSuggestions(wallet),
            {
                wrapper: ({ children }) => (
                    <ReactQueryWrapper client={client}>
                        {children}
                    </ReactQueryWrapper>
                ),
            },
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.isPending).toBe(false);
        expect(result.current.suggestions).toEqual([first]);
        expect(getAccountSuggestionsSpy).toHaveBeenCalledTimes(2);
    });
});
