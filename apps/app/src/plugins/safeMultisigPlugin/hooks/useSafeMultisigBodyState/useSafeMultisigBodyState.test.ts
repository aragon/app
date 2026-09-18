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
import { safeBodyPollInterval } from '../../constants';
import {
    generateSafeConfirmation,
    generateSafeInfo,
    generateSafeMultisigTransaction,
} from '../../testUtils';
import { SafeTransactionState } from '../../types';
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
        expect(result.current.nonceDistance).toEqual(0);
    });

    it('withholds execution across empty nonce slots', () => {
        // Only nonce 8 is queued; the missing slots 6 and 7 still prevent execution.
        mockQueuedTransaction('8');

        const { result } = renderState();

        expect(result.current.isExecutableNow).toBe(false);
        expect(result.current.nonceDistance).toEqual(2);
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

    it('keeps the executed report as the record when a later attempt is queued', () => {
        // Requeue-after-supersession: the body has already decided, and a fresh attempt is sitting
        // in the queue. The decision's confirmations are the ones that executed it, not the
        // attempt's - but the attempt must stay visible as a pending report.
        const executor = '0x0000000000000000000000000000000000000099';
        useSafeSettledReportSpy.mockReturnValue({
            settledReport: {
                transaction: generateSafeMultisigTransaction({
                    nonce: '5',
                    isExecuted: true,
                    confirmationsRequired: 1,
                    confirmations: [
                        generateSafeConfirmation({ owner: executor }),
                    ],
                }),
                report: {
                    proposalId: BigInt(proposalIndex),
                    stageId: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                },
            },
            outcome: settledReportApi.SafeSettledReportOutcome.FOUND,
            isLoading: false,
            isError: false,
        });
        mockQueuedTransaction('6');

        const { result } = renderState({
            results: [
                {
                    pluginAddress: body,
                    stage: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                },
            ],
        });

        expect(result.current.signers).toEqual([executor]);
        expect(result.current.approvalsAmount).toBe(1);
        expect(result.current.minApprovals).toBe(1);
        expect(result.current.pendingReport?.transaction.nonce).toEqual('6');
    });

    it('shows no confirmations for a settled body whose report was not recovered', () => {
        // The queue is not a fallback once the body has decided. A transaction still collecting
        // signatures did not produce the recorded verdict, so presenting its signers as the
        // decision's confirmations would attribute the result to owners who never executed it.
        useSafeSettledReportSpy.mockReturnValue({
            settledReport: undefined,
            outcome: settledReportApi.SafeSettledReportOutcome.SCAN_EXHAUSTED,
            isLoading: false,
            isError: false,
        });
        // The rival carries real signatures, which is what makes the fallback dangerous rather
        // than merely redundant: they belong to owners who never executed anything.
        const bystander = '0x0000000000000000000000000000000000000077';
        useSafePendingTransactionsSpy.mockReturnValue({
            data: {
                results: [
                    generateSafeMultisigTransaction({
                        nonce: '6',
                        to: plugin,
                        confirmationsRequired: 2,
                        confirmations: [
                            generateSafeConfirmation({ owner: bystander }),
                        ],
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

        const { result } = renderState({
            results: [
                {
                    pluginAddress: body,
                    stage: stageIndex,
                    resultType: SppProposalType.APPROVAL,
                },
            ],
        });

        expect(result.current.signers).toEqual([]);
        expect(result.current.approvalsAmount).toBe(0);
        // The attempt is still real and still worth showing as an attempt.
        expect(result.current.pendingReport?.transaction.nonce).toEqual('6');
    });

    it('keeps the confirmations of a report whose nonce the Safe already spent', () => {
        // Nonce 5 is behind the Safe's current 6, so these signatures can never execute - but an
        // owner who signed needs to see their own signature to read the alert telling them the
        // transaction was replaced and a re-queue starts the round again.
        const signer = '0x0000000000000000000000000000000000000088';
        useSafePendingTransactionsSpy.mockReturnValue({
            data: {
                results: [
                    generateSafeMultisigTransaction({
                        nonce: '5',
                        to: plugin,
                        confirmationsRequired: 2,
                        confirmations: [
                            generateSafeConfirmation({ owner: signer }),
                            generateSafeConfirmation({ owner: body }),
                        ],
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

        const { result } = renderState();

        expect(result.current.pendingReport?.state).toBe(
            SafeTransactionState.SUPERSEDED,
        );
        expect(result.current.approvalsAmount).toBe(2);
        expect(result.current.signers).toEqual([signer, body]);
    });

    it('states no member count for a settled body, whose owner set is unrecoverable', () => {
        // "1 of 3" against today's owners is the same substitution the threshold refuses to make.
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
            outcome: settledReportApi.SafeSettledReportOutcome.FOUND,
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

        expect(result.current.membersCount).toBeUndefined();
    });

    it('states the live member count while the body is still deciding', () => {
        mockQueuedTransaction('6');

        const { result } = renderState();

        expect(result.current.membersCount).toBe(
            generateSafeInfo({}).owners.length,
        );
    });

    it('reports the threshold that applied, not the one the Safe has now', () => {
        // Owners can raise the threshold after a report executes. The transaction carries the
        // threshold the service recorded for the block it was mined in, so a 1-of-2 execution must
        // keep reading as one approval of one required - reading the live threshold restates
        // today's rules as history. Not a propose-time immutable: upstream falls back to the
        // Safe's latest status and then the indexed confirmation count.
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

    /** Reads the poll cadence a query was actually mounted with. */
    const pollOf = (spy: jest.SpyInstance) => {
        const lastCall = spy.mock.calls.at(-1) as unknown[];
        const options = lastCall[1] as {
            refetchInterval: (query: {
                state: { error: unknown };
            }) => number | false;
        };

        return options.refetchInterval({ state: { error: null } });
    };

    /**
     * Owners and threshold change with no DAO transaction and nothing queued, so an empty queue
     * must not stop the account read: tying it to the queue left the card describing the Safe as it
     * was when the page loaded. The queue read stays gated, because that one costs Safe quota.
     */
    it('keeps reading the account while the body can still act, with nothing queued', () => {
        const { result } = renderState();

        expect(result.current.canStillAffectOutcome).toBe(true);
        expect(pollOf(useSafeInfoSpy)).toEqual(safeBodyPollInterval);
        expect(pollOf(useSafePendingTransactionsSpy)).toBe(false);
    });

    it('stops reading the account once the stage can no longer be affected', () => {
        renderState({ currentStage: stageIndex + 1 });

        expect(pollOf(useSafeInfoSpy)).toBe(false);
    });
});
