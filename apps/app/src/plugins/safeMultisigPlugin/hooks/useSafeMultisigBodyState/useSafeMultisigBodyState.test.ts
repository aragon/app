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
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { safeMultisigTransactionUtils } from '../../utils/safeMultisigTransactionUtils';
import * as settledReportApi from '../useSafeSettledReport';
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
    const useSafeSettledReportSpy = jest.spyOn(
        settledReportApi,
        'useSafeSettledReport',
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
        useSafeSettledReportSpy.mockReturnValue({
            settledReport: undefined,
            isLoading: false,
            isError: false,
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

    it('reports the current nonce free when nothing in the queue holds it', () => {
        // Allocation hands out the lowest free slot, so a report proposed now would land on the
        // current nonce and execute as soon as it reaches threshold.
        mockQueuedTransaction('8');

        const { result } = renderState();

        expect(result.current.isCurrentNonceFree).toBe(true);
    });

    it('reports the current nonce taken when the queue occupies it', () => {
        mockQueuedTransaction('6');

        const { result } = renderState();

        expect(result.current.isCurrentNonceFree).toBe(false);
    });

    it('serves a settled body the confirmations that executed it', () => {
        // The queue holds nothing by then, so the signer list has to come from the executed report.
        const signer = '0x0000000000000000000000000000000000000099';
        useSafeSettledReportSpy.mockReturnValue({
            settledReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '5',
                    isExecuted: true,
                    transactionHash: `0x${'a'.repeat(64)}`,
                    confirmations: [
                        generateSafeConfirmation({ owner: signer }),
                    ],
                }),
                report: {
                    proposalId: BigInt(proposalIndex),
                    stageId: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
            },
            isLoading: false,
            isError: false,
        });

        const { result } = renderState({
            results: [
                {
                    pluginAddress: body,
                    stage: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                },
            ],
        });

        expect(
            result.current.settledReport?.transaction.transactionHash,
        ).toEqual(`0x${'a'.repeat(64)}`);
        expect(result.current.signers).toEqual([signer]);
    });

    it('reports the threshold that applied, not the one the Safe has now', () => {
        // Owners can raise the threshold after a report executes. The Safe binds
        // confirmationsRequired at propose time, so a 1-of-2 execution must keep reading as one
        // approval of one required - reading the live threshold restates today's rules as history.
        useSafeSettledReportSpy.mockReturnValue({
            settledReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '5',
                    isExecuted: true,
                    confirmationsRequired: 1,
                    confirmations: [generateSafeConfirmation()],
                }),
                report: {
                    proposalId: BigInt(proposalIndex),
                    stageId: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
            },
            isLoading: false,
            isError: false,
        });
        useSafeInfoSpy.mockReturnValue({
            data: generateSafeInfo({ nonce: '6', threshold: 2 }),
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof safeServiceApi.useSafeInfo>);

        const { result } = renderState({
            results: [
                {
                    pluginAddress: body,
                    stage: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                },
            ],
        });

        expect(result.current.approvalsAmount).toBe(1);
        expect(result.current.minApprovals).toBe(1);
    });

    it('counts the settled scan as loading so a settled body never claims no confirmations', () => {
        useSafeSettledReportSpy.mockReturnValue({
            settledReport: undefined,
            isLoading: true,
            isError: false,
        });

        const { result } = renderState({
            results: [
                {
                    pluginAddress: body,
                    stage: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                },
            ],
        });

        expect(result.current.isLoading).toBe(true);
    });

    it('does not scan history while the body has no recorded result', () => {
        // The read costs Safe quota, and until a verdict lands the queue holds everything worth
        // showing.
        mockQueuedTransaction('6');

        renderState();

        expect(useSafeSettledReportSpy).toHaveBeenCalledWith(
            expect.objectContaining({ enabled: false }),
        );
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
