import { renderHook, waitFor } from '@testing-library/react';
import { ReactQueryWrapper } from '@/shared/testUtils';
import {
    type IGetWorkspaceProposalListParams,
    workspaceQueryService,
} from '../../api/workspaceQueryService';
import { generateWorkspaceQueryResponse } from '../../testUtils';
import {
    type IUseWorkspaceProposalListDataParams,
    useWorkspaceProposalListData,
} from './useWorkspaceProposalListData';

describe('useWorkspaceProposalListData hook', () => {
    const getProposalListSpy = jest.spyOn(
        workspaceQueryService,
        'getProposalList',
    );

    const requestParams: IGetWorkspaceProposalListParams = {
        body: { accounts: [], pagination: { pageSize: 20 } },
    };

    afterEach(() => {
        getProposalListSpy.mockReset();
    });

    const renderTestHook = (
        params?: Partial<IUseWorkspaceProposalListDataParams>,
    ) =>
        renderHook(
            () =>
                useWorkspaceProposalListData({
                    params: requestParams,
                    isDaosPending: false,
                    ...params,
                }),
            { wrapper: ReactQueryWrapper },
        );

    it('resolves to the idle state when the request is disabled, e.g. for a workspace with no account', () => {
        const { result } = renderTestHook({ enabled: false });

        expect(result.current.state).toEqual('idle');
        expect(getProposalListSpy).not.toHaveBeenCalled();
    });

    it('stays loading while the DAOs of the rows are pending', async () => {
        getProposalListSpy.mockResolvedValue(generateWorkspaceQueryResponse());
        const { result } = renderTestHook({ isDaosPending: true });

        await waitFor(() => expect(getProposalListSpy).toHaveBeenCalled());
        expect(result.current.state).toEqual('initialLoading');
    });

    it('resolves to the idle state once the proposals and DAOs have loaded', async () => {
        getProposalListSpy.mockResolvedValue(generateWorkspaceQueryResponse());
        const { result } = renderTestHook();

        await waitFor(() => expect(result.current.state).toEqual('idle'));
    });
});
