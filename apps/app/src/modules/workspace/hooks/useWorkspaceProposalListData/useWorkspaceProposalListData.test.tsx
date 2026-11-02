import { renderHook, waitFor } from '@testing-library/react';
import { Network } from '@/shared/api/daoService';
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

    const buildRequestParams = (
        accounts: IGetWorkspaceProposalListParams['body']['accounts'] = [
            {
                network: Network.ETHEREUM_SEPOLIA,
                address: '0xE8fd9Fe445A037ee07fb98FDD4b146d939140De5',
            },
        ],
    ): IGetWorkspaceProposalListParams => ({
        body: { accounts, pagination: { pageSize: 20 } },
    });

    afterEach(() => {
        getProposalListSpy.mockReset();
    });

    const renderTestHook = (
        params?: Partial<IUseWorkspaceProposalListDataParams>,
    ) =>
        renderHook(
            () =>
                useWorkspaceProposalListData({
                    params: buildRequestParams(),
                    isDaosPending: false,
                    ...params,
                }),
            { wrapper: ReactQueryWrapper },
        );

    it('resolves to the idle state without requesting anything when the selection holds no account', () => {
        const { result } = renderTestHook({ params: buildRequestParams([]) });

        expect(result.current.state).toEqual('idle');
        expect(getProposalListSpy).not.toHaveBeenCalled();
    });

    // An account still being resolved is not an empty selection, so it must not read as one.
    it('stays loading while the accounts are being resolved', () => {
        const { result } = renderTestHook({
            params: buildRequestParams([]),
            isPending: true,
        });

        expect(result.current.state).toEqual('initialLoading');
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
