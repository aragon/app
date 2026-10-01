import {
    concatHex,
    encodeFunctionData,
    encodePacked,
    type Hex,
    size,
} from 'viem';
import { safeMultiSendAbi } from '@/modules/safe/utils/safeTransactionEnvelopeUtils';
import { globalExecutorAbi } from '@/shared/utils/transactionUtils/globalExecutorAbi';
import { generateSafeMultisigTransaction } from '../../testUtils';
import { safeDaoProposalUtils } from './safeDaoProposalUtils';

describe('safe DAO proposal utils', () => {
    const daoAddress = '0x1111111111111111111111111111111111111111';
    const otherAddress = '0x2222222222222222222222222222222222222222';
    const multiSendAddress = '0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761';
    const action = {
        to: otherAddress as Hex,
        value: BigInt(0),
        data: '0x12345678' as Hex,
    };
    const secondAction = {
        to: daoAddress as Hex,
        value: BigInt(1),
        data: '0x87654321' as Hex,
    };
    const buildExecute = (actions = [action]): Hex =>
        encodeFunctionData({
            abi: globalExecutorAbi,
            functionName: 'execute',
            args: [
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                actions,
                BigInt(0),
            ],
        });

    const encodeMultiSend = (
        calls: Array<{ to: string; data: Hex; operation?: number }>,
        trailingData: Hex = '0x',
    ): Hex =>
        encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [
                concatHex([
                    ...calls.map(({ to, data, operation = 0 }) =>
                        encodePacked(
                            ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                            [
                                operation,
                                to as Hex,
                                BigInt(0),
                                BigInt(size(data)),
                                data,
                            ],
                        ),
                    ),
                    trailingData,
                ]),
            ],
        });

    it('qualifies IDs with transaction hashes across nonce competitors and Safes', () => {
        const sameSafeNonceCompetitor = generateSafeMultisigTransaction({
            nonce: '7',
            safeTxHash: `0x${'1'.repeat(64)}`,
        });
        const sameSafeRival = generateSafeMultisigTransaction({
            nonce: '7',
            safeTxHash: `0x${'2'.repeat(64)}`,
        });
        const differentSafeTransaction = generateSafeMultisigTransaction({
            nonce: '7',
            safeTxHash: `0x${'3'.repeat(64)}`,
        });

        const displayIds = [
            sameSafeNonceCompetitor,
            sameSafeRival,
            differentSafeTransaction,
        ].map((transaction) =>
            safeDaoProposalUtils.getProposalDisplayId(transaction),
        );

        expect(new Set(displayIds).size).toBe(3);
        expect(displayIds.every((id) => id.startsWith('SAFE-7 · '))).toBe(true);
    });

    it('extracts actions from a direct DAO.execute call', () => {
        const transaction = generateSafeMultisigTransaction({
            to: daoAddress,
            data: buildExecute(),
        });

        expect(
            safeDaoProposalUtils.findDaoExecuteActions({
                transaction,
                daoAddress,
            }),
        ).toEqual([action]);
    });

    it('finds a DAO.execute call nested in MultiSend', () => {
        const transaction = generateSafeMultisigTransaction({
            to: multiSendAddress,
            operation: 1,
            data: encodeMultiSend([{ to: daoAddress, data: buildExecute() }]),
        });

        expect(
            safeDaoProposalUtils.isDaoProposal({ transaction, daoAddress }),
        ).toBe(true);
    });

    it('does not unpack MultiSend-shaped calldata from an arbitrary delegate target', () => {
        const transaction = generateSafeMultisigTransaction({
            to: otherAddress,
            operation: 1,
            data: encodeMultiSend([{ to: daoAddress, data: buildExecute() }]),
        });

        expect(
            safeDaoProposalUtils.isDaoProposal({ transaction, daoAddress }),
        ).toBe(false);
    });

    it('collects actions from every DAO.execute call in one MultiSend', () => {
        const transaction = generateSafeMultisigTransaction({
            to: multiSendAddress,
            operation: 1,
            data: encodeMultiSend([
                { to: daoAddress, data: buildExecute([action]) },
                { to: daoAddress, data: buildExecute([secondAction]) },
            ]),
        });

        expect(
            safeDaoProposalUtils.findDaoExecuteActions({
                transaction,
                daoAddress,
            }),
        ).toEqual([action, secondAction]);
    });

    it('rejects a truncated MultiSend even when its prefix is a DAO.execute call', () => {
        const transaction = generateSafeMultisigTransaction({
            to: multiSendAddress,
            operation: 1,
            data: encodeMultiSend(
                [{ to: daoAddress, data: buildExecute() }],
                '0x00',
            ),
        });

        expect(
            safeDaoProposalUtils.isDaoProposal({ transaction, daoAddress }),
        ).toBe(false);
    });

    it.each([
        {
            label: 'another target',
            to: otherAddress,
            data: buildExecute(),
            operation: 0 as const,
        },
        {
            label: 'a delegate call',
            to: daoAddress,
            data: buildExecute(),
            operation: 1 as const,
        },
        {
            label: 'unknown calldata',
            to: daoAddress,
            data: '0xdeadbeef' as Hex,
            operation: 0 as const,
        },
    ])('rejects $label as a DAO proposal', ({ to, data, operation }) => {
        const transaction = generateSafeMultisigTransaction({
            to,
            data,
            operation,
        });

        expect(
            safeDaoProposalUtils.isDaoProposal({ transaction, daoAddress }),
        ).toBe(false);
    });
});
