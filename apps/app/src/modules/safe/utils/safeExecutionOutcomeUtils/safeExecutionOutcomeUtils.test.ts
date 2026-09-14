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
});
