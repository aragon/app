import { encodeFunctionData, erc20Abi, parseAbi } from 'viem';
import { safeCalldataUtils } from './safeCalldataUtils';

describe('safeCalldata utils', () => {
    describe('decodeFunctionName', () => {
        it('names a governance call from its calldata without any network read', () => {
            const data = encodeFunctionData({
                abi: parseAbi([
                    'function advanceProposal(uint256 _proposalId)',
                ]),
                functionName: 'advanceProposal',
                args: [BigInt(3)],
            });

            expect(safeCalldataUtils.decodeFunctionName(data)).toBe(
                'advanceProposal',
            );
        });

        it('names a value movement, which is what an owner most needs read back to them', () => {
            const data = encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [`0x${'11'.repeat(20)}`, BigInt(1)],
            });

            expect(safeCalldataUtils.decodeFunctionName(data)).toBe('transfer');
        });

        it('names a call that changes who controls the Safe', () => {
            const data = encodeFunctionData({
                abi: parseAbi(['function changeThreshold(uint256 _threshold)']),
                functionName: 'changeThreshold',
                args: [BigInt(1)],
            });

            expect(safeCalldataUtils.decodeFunctionName(data)).toBe(
                'changeThreshold',
            );
        });

        it.each([
            { label: 'a selector outside the bundled set', data: '0xdeadbeef' },
            { label: 'empty calldata', data: '0x' },
            { label: 'nothing at all', data: undefined },
        ])('returns undefined for $label, rather than guessing', (params) => {
            // Undefined is the honest answer and the caller falls back to raw calldata; a wrong
            // label inside a consent surface is worse than no label.
            expect(
                safeCalldataUtils.decodeFunctionName(params.data),
            ).toBeUndefined();
        });

        it('returns undefined when a known selector carries arguments that do not decode', () => {
            const data = `${encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [`0x${'11'.repeat(20)}`, BigInt(1)],
            }).slice(0, 12)}` as const;

            expect(safeCalldataUtils.decodeFunctionName(data)).toBeUndefined();
        });
    });

    describe('disagrees', () => {
        it('reports a disagreement when two decoders name different functions', () => {
            expect(safeCalldataUtils.disagrees('transfer', 'approve')).toBe(
                true,
            );
        });

        it.each([
            {
                label: 'the local decoder has no answer',
                local: undefined,
                remote: 'transfer',
            },
            {
                label: 'the remote decoder has no answer',
                local: 'transfer',
                remote: undefined,
            },
            {
                label: 'the remote answer is absent',
                local: 'transfer',
                remote: null,
            },
            { label: 'both agree', local: 'transfer', remote: 'transfer' },
        ])('is not a disagreement when $label', (params) => {
            // A selector this app cannot decode is not a contradiction - the other decoder simply
            // knows more ABIs.
            expect(
                safeCalldataUtils.disagrees(params.local, params.remote),
            ).toBe(false);
        });
    });
});
