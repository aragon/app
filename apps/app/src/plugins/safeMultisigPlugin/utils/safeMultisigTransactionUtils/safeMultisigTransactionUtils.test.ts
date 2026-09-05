import {
    concatHex,
    encodeFunctionData,
    encodePacked,
    type Hex,
    size,
} from 'viem';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import { generateSafeMultisigTransaction } from '../../testUtils';
import { safeMultiSendAbi } from './safeMultiSendAbi';
import { safeMultisigTransactionUtils } from './safeMultisigTransactionUtils';

describe('safeMultisigTransaction utils', () => {
    const pluginAddress = '0x1111111111111111111111111111111111111111';
    const multiSendAddress = '0x9999999999999999999999999999999999999999';
    const unrelatedAddress = '0x2222222222222222222222222222222222222222';
    const proposalId = '42';
    const stageId = 1;

    const buildReport = (params?: {
        proposalId?: string;
        stageId?: number;
        resultType?: SppProposalType;
    }) =>
        safeMultisigTransactionUtils.buildReportProposalResultData({
            proposalId: params?.proposalId ?? proposalId,
            stageId: params?.stageId ?? stageId,
            resultType: params?.resultType ?? SppProposalType.APPROVAL,
        });

    const encodeMultiSend = (calls: Array<{ to: string; data: Hex }>): Hex => {
        const packedCalls = calls.map(({ to, data }) =>
            encodePacked(
                ['uint8', 'address', 'uint256', 'uint256', 'bytes'],
                [0, to as Hex, BigInt(0), BigInt(size(data)), data],
            ),
        );

        return encodeFunctionData({
            abi: safeMultiSendAbi,
            functionName: 'multiSend',
            args: [concatHex(packedCalls)],
        });
    };

    describe('buildReportProposalResultData', () => {
        it.each([
            { resultType: SppProposalType.NONE },
            { resultType: SppProposalType.APPROVAL },
            { resultType: SppProposalType.VETO },
        ])(
            'decodes the governance effect $resultType back from the built calldata',
            ({ resultType }) => {
                const data = buildReport({ resultType });

                expect(
                    safeMultisigTransactionUtils.decodeProposalResultReport(
                        data,
                    ),
                ).toEqual({
                    proposalId: BigInt(proposalId),
                    stageId,
                    resultType,
                    tryAdvance: false,
                });
            },
        );

        it.each([
            { data: null, label: 'a value transfer' },
            { data: '0x', label: 'empty calldata' },
            { data: '0xdeadbeef', label: 'an unknown selector' },
        ])('returns undefined for $label', ({ data }) => {
            expect(
                safeMultisigTransactionUtils.decodeProposalResultReport(data),
            ).toBeUndefined();
        });
    });

    describe('findProposalResultReport', () => {
        it.each([
            {
                label: 'a direct call to the plugin',
                to: pluginAddress,
                data: buildReport(),
                found: true,
            },
            {
                label: 'a report bundled inside a multiSend batch',
                to: multiSendAddress,
                data: encodeMultiSend([
                    { to: pluginAddress, data: buildReport() },
                ]),
                found: true,
            },
            {
                label: 'a report behind an undecodable inner call',
                to: multiSendAddress,
                data: encodeMultiSend([
                    { to: unrelatedAddress, data: '0xdeadbeefcafe' },
                    { to: pluginAddress, data: buildReport() },
                ]),
                found: true,
            },
            {
                label: 'a report nested in a batch of batches',
                to: multiSendAddress,
                data: encodeMultiSend([
                    {
                        to: multiSendAddress,
                        data: encodeMultiSend([
                            { to: pluginAddress, data: buildReport() },
                        ]),
                    },
                ]),
                found: true,
            },
            {
                label: 'a report targeting another plugin',
                to: unrelatedAddress,
                data: buildReport(),
                found: false,
            },
            {
                label: 'a report for another proposal',
                to: pluginAddress,
                data: buildReport({ proposalId: '43' }),
                found: false,
            },
            {
                label: 'a report for another stage',
                to: pluginAddress,
                data: buildReport({ stageId: 2 }),
                found: false,
            },
            {
                label: 'a batch without any report',
                to: multiSendAddress,
                data: encodeMultiSend([
                    { to: unrelatedAddress, data: '0xdeadbeef' },
                ]),
                found: false,
            },
            {
                label: 'a plain value transfer',
                to: pluginAddress,
                data: null,
                found: false,
            },
        ])('$label is correlated: $found', ({ to, data, found }) => {
            const transaction = generateSafeMultisigTransaction({ to, data });

            const report =
                safeMultisigTransactionUtils.findProposalResultReport({
                    transaction,
                    pluginAddress,
                    proposalId,
                    stageId,
                });

            expect(report != null).toEqual(found);
        });

        it.each([
            { label: 'string', proposalId: '42' },
            { label: 'bigint', proposalId: BigInt(42) },
        ])(
            'matches a proposal id given as a $label',
            ({ proposalId: proposalIdParam }) => {
                const transaction = generateSafeMultisigTransaction({
                    to: pluginAddress,
                    data: buildReport(),
                });

                expect(
                    safeMultisigTransactionUtils.findProposalResultReport({
                        transaction,
                        pluginAddress,
                        proposalId: proposalIdParam,
                        stageId,
                    }),
                ).toEqual({
                    proposalId: BigInt(proposalId),
                    stageId,
                    resultType: SppProposalType.APPROVAL,
                    tryAdvance: false,
                });
            },
        );

        it('reports the governance effect of a veto nested in a batch', () => {
            const transaction = generateSafeMultisigTransaction({
                to: multiSendAddress,
                data: encodeMultiSend([
                    { to: unrelatedAddress, data: '0xdeadbeef' },
                    {
                        to: pluginAddress,
                        data: buildReport({
                            resultType: SppProposalType.VETO,
                        }),
                    },
                ]),
            });

            const report =
                safeMultisigTransactionUtils.findProposalResultReport({
                    transaction,
                    pluginAddress,
                    proposalId,
                    stageId,
                });

            expect(report?.resultType).toEqual(SppProposalType.VETO);
        });
    });
});
