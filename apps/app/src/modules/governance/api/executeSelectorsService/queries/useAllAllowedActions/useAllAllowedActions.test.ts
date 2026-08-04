import { renderHook, waitFor } from '@testing-library/react';
import { generateAllowedAction } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    generatePaginatedResponse,
    ReactQueryWrapper,
} from '@/shared/testUtils';
import { executeSelectorsService } from '../../executeSelectorsService';
import { useAllAllowedActions } from './useAllAllowedActions';

describe('useAllAllowedActions query', () => {
    const getAllowedActionsSpy = jest.spyOn(
        executeSelectorsService,
        'getAllowedActions',
    );

    // The DAO is on Ethereum for every test, the requested chain is what varies.
    const daoNetwork = Network.ETHEREUM_MAINNET;
    const daoChainId = networkDefinitions[daoNetwork].id;
    const otherChainId = networkDefinitions[Network.BASE_MAINNET].id;

    const daoChainAction = generateAllowedAction({
        target: '0xdaochain',
        chainId: daoChainId,
    });
    const otherChainAction = generateAllowedAction({
        target: '0xotherchain',
        chainId: otherChainId,
    });
    const noChainAction = generateAllowedAction({ target: '0xnochain' });

    beforeEach(() => {
        getAllowedActionsSpy.mockResolvedValue(
            generatePaginatedResponse({
                data: [daoChainAction, otherChainAction, noChainAction],
            }),
        );
    });

    afterEach(() => {
        getAllowedActionsSpy.mockReset();
    });

    const renderAllowedActionsHook = (chainId?: number) =>
        renderHook(
            () =>
                useAllAllowedActions({
                    urlParams: { network: daoNetwork, pluginAddress: '0x123' },
                    chainId,
                }),
            { wrapper: ReactQueryWrapper },
        );

    it('returns the actions of the specified chain and the actions without a chain ID when the specified chain is the DAO chain', async () => {
        const { result } = renderAllowedActionsHook(daoChainId);

        await waitFor(() =>
            expect(result.current.data).toEqual([
                daoChainAction,
                noChainAction,
            ]),
        );
    });

    it('filters out the actions without a chain ID when the specified chain is not the DAO chain', async () => {
        const { result } = renderAllowedActionsHook(otherChainId);

        await waitFor(() =>
            expect(result.current.data).toEqual([otherChainAction]),
        );
    });

    it('returns the actions of all chains when no chain ID is specified', async () => {
        const { result } = renderAllowedActionsHook();

        await waitFor(() =>
            expect(result.current.data).toEqual([
                daoChainAction,
                otherChainAction,
                noChainAction,
            ]),
        );
    });
});
