import { encodeAbiParameters, type Hex, pad, toEventSelector } from 'viem';
import {
    type ISafeExecutionReceipt,
    SafeExecutionOutcome,
    safeExecutionOutcomeUtils,
} from './safeExecutionOutcomeUtils';

describe('safeExecutionOutcome utils', () => {
    const safeTxHash = `0x${'ab'.repeat(32)}` as Hex;
    const otherTxHash = `0x${'cd'.repeat(32)}` as Hex;
    const safeAddress = `0x${'11'.repeat(20)}` as Hex;
    const impostor = `0x${'22'.repeat(20)}` as Hex;
    const successTopic = toEventSelector('ExecutionSuccess(bytes32,uint256)');
    const failureTopic = toEventSelector('ExecutionFailure(bytes32,uint256)');

    // Safe 1.4.1 marks `txHash` indexed, so it travels in topics and only the payment is in data.
    const indexedLog = (topic: Hex, hash: Hex, address: Hex = safeAddress) => ({
        address,
        topics: [topic, hash] as Hex[],
        data: pad('0x01') as Hex,
    });

    // Safe 1.3.0 leaves `txHash` unindexed, so both arguments sit in data.
    const unindexedLog = (
        topic: Hex,
        hash: Hex,
        address: Hex = safeAddress,
    ) => ({
        address,
        topics: [topic] as Hex[],
        data: encodeAbiParameters(
            [{ type: 'bytes32' }, { type: 'uint256' }],
            [hash, BigInt(1)],
        ),
    });
    const classify = (receipt: ISafeExecutionReceipt) =>
        safeExecutionOutcomeUtils.classify({
            receipt,
            safeTxHash,
            safeAddress,
        });

    it('ignores a matching event emitted by anything other than the Safe', () => {
        // A batch executes arbitrary calls, so an inner call can emit ExecutionSuccess carrying
        // this transaction's own hash. The Safe emits its verdict last, so attributing the first
        // matching log would let a forged one mask the real failure that follows it.
        expect(
            classify({
                status: 'success',
                logs: [
                    indexedLog(successTopic, safeTxHash, impostor),
                    indexedLog(failureTopic, safeTxHash),
                ],
            }),
        ).toBe(SafeExecutionOutcome.EXECUTION_FAILURE);
    });

    it('claims nothing when only an impostor emitted the event', () => {
        expect(
            classify({
                status: 'success',
                logs: [unindexedLog(successTopic, safeTxHash, impostor)],
            }),
        ).toBe(SafeExecutionOutcome.UNMATCHED);
    });
    it('reports an outer revert without looking for an event', () => {
        // A reverted `execTransaction` rolled the nonce increment back, so no event was emitted and
        // the transaction can still execute later at the same nonce.
        expect(
            classify({
                status: 'reverted',
                logs: [indexedLog(successTopic, safeTxHash)],
            }),
        ).toBe(SafeExecutionOutcome.OUTER_REVERT);
    });

    it.each([
        { version: '1.4.1', log: indexedLog },
        { version: '1.3.0', log: unindexedLog },
    ])(
        'reads success from a Safe $version receipt, where the hash is stored differently',
        ({ log }) => {
            expect(
                classify({
                    status: 'success',
                    logs: [log(successTopic, safeTxHash)],
                }),
            ).toBe(SafeExecutionOutcome.EXECUTION_SUCCESS);
        },
    );

    it.each([
        { version: '1.4.1', log: indexedLog },
        { version: '1.3.0', log: unindexedLog },
    ])('reads a failed inner call from a Safe $version receipt', ({ log }) => {
        // The outer transaction succeeded, so a receipt-only check would call this executed.
        // The nonce is consumed either way, but the payload's effect never happened.
        expect(
            classify({
                status: 'success',
                logs: [log(failureTopic, safeTxHash)],
            }),
        ).toBe(SafeExecutionOutcome.EXECUTION_FAILURE);
    });

    it('ignores a Safe event belonging to another transaction', () => {
        // One outer transaction can drive several Safe transactions - a nested Safe, or a batch
        // dispatching another Safe's queue. Attributing any success in the receipt to ours would
        // report a result this transaction did not produce.
        expect(
            classify({
                status: 'success',
                logs: [indexedLog(successTopic, otherTxHash)],
            }),
        ).toBe(SafeExecutionOutcome.UNMATCHED);
    });

    it('takes the matching event when the receipt carries several', () => {
        expect(
            classify({
                status: 'success',
                logs: [
                    indexedLog(successTopic, otherTxHash),
                    unindexedLog(failureTopic, safeTxHash),
                ],
            }),
        ).toBe(SafeExecutionOutcome.EXECUTION_FAILURE);
    });

    it('claims nothing when a successful receipt holds no Safe event', () => {
        // Neither success nor failure is known here, so neither may be shown.
        expect(classify({ status: 'success', logs: [] })).toBe(
            SafeExecutionOutcome.UNMATCHED,
        );
    });

    it('does not mistake a truncated event payload for a hash', () => {
        // An unindexed log too short to hold a word cannot identify a transaction.
        expect(
            classify({
                status: 'success',
                logs: [
                    {
                        address: safeAddress,
                        topics: [successTopic],
                        data: '0x01',
                    },
                ],
            }),
        ).toBe(SafeExecutionOutcome.UNMATCHED);
    });

    /**
     * Two receipts read back from the sepolia gate Safe `0x8442c05d…725c39A` (v1.4.1), which is
     * what makes them worth keeping: the emitter addresses, topics and log ordering below are the
     * chain's, copied verbatim, not this file's constructions. Only the `data` of each
     * `SafeMultiSigTransaction` log is elided to `0x` - classification reads the emitter and the
     * topics, never that payload.
     */
    describe('real sepolia receipts', () => {
        const gateSafe = '0x8442c05d620e11009bdaeddefda3b5303725c39a';
        const sppPlugin = '0xc18021bf09671a21f474a8c059c987ba895bdbf7';
        const multiSigTopic =
            '0x66753cd2356569ee081232e3be8909b950e0a76c1f8460c3a5e3c2be32b11bed' as Hex;
        const zeroPayment =
            '0x0000000000000000000000000000000000000000000000000000000000000000' as Hex;

        it('reads ExecutionFailure from a batch whose outer call succeeded', () => {
            // nonce 5, tx 0x6b5e021d…, safeTxGas 250000. Safe's own app lists it as Failed.
            const failedTxHash =
                '0x36833f17568b0284836585969f41705b3f71c8400ff9e3280a9f260301526bee';

            expect(
                safeExecutionOutcomeUtils.classify({
                    receipt: {
                        status: 'success',
                        logs: [
                            {
                                address: gateSafe,
                                topics: [multiSigTopic],
                                data: '0x',
                            },
                            {
                                address: gateSafe,
                                topics: [
                                    '0x23428b18acfb3ea64b08dc0c1d296ea9c09702c09083ca5272e64d115b687d23',
                                    failedTxHash,
                                ] as Hex[],
                                data: zeroPayment,
                            },
                        ],
                    },
                    safeTxHash: failedTxHash,
                    safeAddress: gateSafe,
                }),
            ).toBe(SafeExecutionOutcome.EXECUTION_FAILURE);
        });

        it('reads ExecutionSuccess past a foreign event in the same receipt', () => {
            // nonce 4, tx 0xda718cd5…: the SPP plugin's ProposalResultReported sits between the
            // Safe's two events, and its topics[3] even carries the Safe's own address.
            const reportedTxHash =
                '0xc1f06a767eab76d4484dc52e115f97f66482b73c99488a4bc35b28b64ff73d3d';

            expect(
                safeExecutionOutcomeUtils.classify({
                    receipt: {
                        status: 'success',
                        logs: [
                            {
                                address: gateSafe,
                                topics: [multiSigTopic],
                                data: '0x',
                            },
                            {
                                address: sppPlugin,
                                topics: [
                                    '0xbfaa970a350cc4e6c21888b5c4b888e2750f035ce824e40cfc7dc5f07e3936c5',
                                    '0xc4c1bd4e48d9e9b8f017822f273e886c1646cb5a742fa12cb7320e8812736310',
                                    '0x0000000000000000000000000000000000000000000000000000000000000001',
                                    '0x0000000000000000000000008442c05d620e11009bdaeddefda3b5303725c39a',
                                ] as Hex[],
                                data: '0x',
                            },
                            {
                                address: gateSafe,
                                topics: [
                                    '0x442e715f626346e8c54381002da614f62bee8d27386535b2521ec8540898556e',
                                    reportedTxHash,
                                ] as Hex[],
                                data: zeroPayment,
                            },
                        ],
                    },
                    safeTxHash: reportedTxHash,
                    safeAddress: gateSafe,
                }),
            ).toBe(SafeExecutionOutcome.EXECUTION_SUCCESS);
        });
    });
});
