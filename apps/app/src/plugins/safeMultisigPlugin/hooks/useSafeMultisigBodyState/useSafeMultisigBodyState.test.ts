import { renderHook } from '@testing-library/react';
import * as walletAccountApi from '@/modules/application/hooks/useWalletAccount';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
} from '@/plugins/sppPlugin/testUtils';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { Network } from '@/shared/api/daoService';
import * as safeServiceApi from '@/shared/api/safeService';
import {
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import { useSafeMultisigBodyState } from './useSafeMultisigBodyState';

describe('useSafeMultisigBodyState hook', () => {
    const body = '0x0000000000000000000000000000000000000001';
    const plugin = '0x0000000000000000000000000000000000000002';
    const stageIndex = 1;
    const proposalIndex = '42';
    const hour = 60 * 60;

    const useSafeInfoSpy = jest.spyOn(safeServiceApi, 'useSafeInfo');
    const useSafePendingTransactionsSpy = jest.spyOn(
        safeServiceApi,
        'useSafePendingTransactions',
    );
    const useWalletAccountSpy = jest.spyOn(
        walletAccountApi,
        'useWalletAccount',
    );

    /**
     * A real queued transaction: the calldata comes from the production encoder, so correlation runs
     * for real instead of against a hand-written payload.
     */
    const mockQueuedTransaction = (nonce: string) => {
        useSafePendingTransactionsSpy.mockReturnValue({
            data: {
                results: [
                    generateSafeMultisigTransaction({
                        nonce,
                        to: plugin,
                        data: safeMultisigTransactionUtils.buildReportProposalResultData(
                            {
                                proposalId: BigInt(proposalIndex),
                                stageId: stageIndex,
                                resultType: SppProposalType.APPROVAL,
                            },
                        ),
                    }),
                ],
                meta: { stale: false },
            },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<
            typeof safeServiceApi.useSafePendingTransactions
        >);
    };

    const renderState = (params?: {
        currentStage?: number;
        maxAdvance?: number;
        results?: Array<{
            pluginAddress: string;
            stage: number;
            resultType: SppProposalType;
        }>;
    }) => {
        const {
            currentStage = stageIndex,
            maxAdvance = 24 * hour,
            results,
        } = params ?? {};

        // Both windows are measured from the last stage transition, so an elapsed `maxAdvance` is
        // expressed by placing that transition further in the past.
        const stage = generateSppStage({ stageIndex, maxAdvance });
        const proposal = generateSppProposal({
            network: Network.ETHEREUM_MAINNET,
            pluginAddress: plugin,
            proposalIndex,
            stageIndex: currentStage,
            lastStageTransition: Math.floor(Date.now() / 1000) - hour,
            settings: generateSppPluginSettings({
                stages: [generateSppStage({ stageIndex: 0 }), stage],
            }),
            results,
        });

        return renderHook(() =>
            useSafeMultisigBodyState({
                network: proposal.network,
                address: body,
                proposal,
                stage,
            }),
        );
    };

    beforeEach(() => {
        useWalletAccountSpy.mockReturnValue({
            address: undefined,
            chainId: undefined,
            isConnecting: false,
            isReconnecting: false,
        });
        useSafeInfoSpy.mockReturnValue({
            data: generateSafeInfo({ nonce: '6', threshold: 1 }),
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

    it('treats a transaction sitting on the current nonce as executable now', () => {
        mockQueuedTransaction('6');

        const { result } = renderState();

        expect(result.current.pendingReport).toBeDefined();
        expect(result.current.isExecutableNow).toBe(true);
        expect(result.current.transactionsAhead).toEqual(0);
    });

    it('counts the transactions ahead rather than calling a confirmed transaction executable', () => {
        // A confirmation binds one exact nonce, so a transaction two places back is waiting however
        // completely it is confirmed - and it cannot be moved without voiding those confirmations.
        mockQueuedTransaction('8');

        const { result } = renderState();

        expect(result.current.isExecutableNow).toBe(false);
        expect(result.current.transactionsAhead).toEqual(2);
    });

    it('keeps watching the queue on a reportable stage even once a result is indexed', () => {
        // A Safe transaction never expires and a verdict has no deadline, so a queued transaction
        // can still execute and overwrite the recorded result.
        mockQueuedTransaction('6');

        const { result } = renderState({
            results: [
                {
                    pluginAddress: body,
                    stage: stageIndex,
                    resultType: SppProposalType.VETO,
                },
            ],
        });

        expect(result.current.settledResultType).toEqual(SppProposalType.VETO);
        expect(result.current.isStageCurrent).toBe(true);
        expect(result.current.pendingReport).toBeDefined();
        expect(useSafePendingTransactionsSpy).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({ enabled: true }),
        );
    });

    it('separates being recordable from being able to change the outcome', () => {
        // Past `maxAdvance` the stage can never advance, so executing still succeeds onchain and
        // still changes nothing.
        mockQueuedTransaction('6');

        const { result } = renderState({ maxAdvance: hour / 2 });

        expect(result.current.isStageCurrent).toBe(true);
        expect(result.current.canStillAffectOutcome).toBe(false);
    });

    it('stops reading the queue once the proposal advanced past the stage', () => {
        // Past the stage the queue is moot to this proposal, so it must not spend Safe quota.
        const { result } = renderState({ currentStage: stageIndex + 1 });

        expect(result.current.isStageCurrent).toBe(false);
        expect(useSafePendingTransactionsSpy).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({ enabled: false }),
        );
    });
});
