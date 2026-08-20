import { renderHook } from '@testing-library/react';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import {
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import { generateSafeInfo } from '../../testUtils';
import { useSafeMultisigBodyState } from './useSafeMultisigBodyState';

describe('useSafeMultisigBodyState hook', () => {
    const body = '0x0000000000000000000000000000000000000001';
    const safeInfo = generateSafeInfo({
        threshold: 1,
        owners: [
            '0x0000000000000000000000000000000000000011',
            '0x0000000000000000000000000000000000000012',
        ],
    });
    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useSafePendingTransactionsSpy = jest.spyOn(
        safeServiceApi,
        'useSafePendingTransactions',
    );
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });
        useSafeInfoSpy.mockReturnValue({
            data: safeInfo,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof safeServiceApi.useSafeInfo>);
        useSafePendingTransactionsSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as ReturnType<typeof safeServiceApi.useSafePendingTransactions>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('uses only the indexed body result to enter settled state', () => {
        const proposal = generateSppProposal({
            network: Network.ETHEREUM_MAINNET,
            results: [
                {
                    pluginAddress: body,
                    stage: 1,
                    resultType: SppProposalType.VETO,
                },
            ],
        });
        const stage = generateSppStage({ stageIndex: 1 });

        const { result } = renderHook(() =>
            useSafeMultisigBodyState({
                network: proposal.network,
                address: body,
                proposal,
                stage,
            }),
        );

        expect(result.current.settledResultType).toEqual(SppProposalType.VETO);
        expect(result.current.approvalsAmount).toEqual(1);
        expect(result.current.minApprovals).toEqual(1);
        expect(result.current.membersCount).toEqual(2);
        expect(result.current.pendingReport).toBeUndefined();
        expect(useSafePendingTransactionsSpy).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({ enabled: false }),
        );
    });
});
