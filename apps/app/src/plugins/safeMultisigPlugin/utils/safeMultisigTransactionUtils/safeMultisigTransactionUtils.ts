import { addressUtils } from '@aragon/gov-ui-kit';
import {
    type AbiFunction,
    decodeFunctionData,
    encodeFunctionData,
    getAbiItem,
    type Hex,
    toFunctionSelector,
} from 'viem';
import { sppReportProposalResultAbi } from '@/plugins/sppPlugin/dialogs/sppReportProposalResultDialog/sppReportProposalResultAbi';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import type { ISafeCall, ISafeProposalResultReport } from '../../types';
import { safeMultiSendAbi, safeMultiSendSelector } from './safeMultiSendAbi';

export interface IBuildReportProposalResultDataParams {
    /**
     * Onchain index of the SPP proposal, as returned by the API (`proposalIndex`) or already
     * decoded.
     */
    proposalId: string | bigint;
    /**
     * Index of the stage the result is reported for.
     */
    stageId: number;
    /**
     * Governance effect being reported.
     */
    resultType: SppProposalType;
}

export interface IFindProposalResultReportParams {
    /**
     * Safe transaction to search, including any MultiSend batch it carries.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Address of the SPP plugin the report must target.
     */
    pluginAddress: string;
    /**
     * Onchain index of the SPP proposal. The API returns it as a string while the decoded call
     * yields a bigint, so both forms are accepted and normalised here.
     */
    proposalId: string | bigint;
    /**
     * Index of the stage the report must be for.
     */
    stageId: number;
}

const reportProposalResultAbiItem = getAbiItem({
    abi: sppReportProposalResultAbi,
    name: 'reportProposalResult',
}) as AbiFunction;

const reportProposalResultSelector = toFunctionSelector(
    reportProposalResultAbiItem,
);

// Each packed MultiSend call is operation (1 byte) + to (20) + value (32) + data length (32),
// expressed here in hex characters.
const multiSendHeaderLength = 2 + 40 + 64 + 64;

// Batches nest in theory but never deeply in practice; the cap bounds a hostile payload.
const maxMultiSendDepth = 4;

const resultTypes = [
    SppProposalType.NONE,
    SppProposalType.APPROVAL,
    SppProposalType.VETO,
];

/**
 * Pure encoding and correlation of SPP result reports carried by Safe transactions.
 *
 * Reports created outside the app are routinely bundled into a MultiSend batch, so correlation
 * walks nested calls as well as the top-level one. Everything is decoded from the raw `data`:
 * the transaction service only decodes ABIs it knows, and SPP is not one of them.
 */
class SafeMultisigTransactionUtils {
    buildReportProposalResultData = (
        params: IBuildReportProposalResultDataParams,
    ): Hex => {
        const { proposalId, stageId, resultType } = params;

        // `_tryAdvance` stays false: advancing the stage closes the report-overwrite window that
        // makes recovery from a wrong report possible.
        return encodeFunctionData({
            abi: sppReportProposalResultAbi,
            functionName: 'reportProposalResult',
            args: [this.normalizeProposalId(proposalId), stageId, resultType, false],
        });
    };

    findProposalResultReport = (
        params: IFindProposalResultReportParams,
    ): ISafeProposalResultReport | undefined => {
        const { transaction, pluginAddress, proposalId, stageId } = params;

        const call: ISafeCall = {
            to: transaction.to,
            data: transaction.data,
            operation: transaction.operation,
            value: BigInt(transaction.value),
        };

        return this.findReportInCall(call, {
            pluginAddress,
            proposalId: this.normalizeProposalId(proposalId),
            stageId,
        });
    };

    decodeProposalResultReport = (
        data: string | null,
    ): ISafeProposalResultReport | undefined => {
        if (this.getSelector(data) !== reportProposalResultSelector) {
            return undefined;
        }

        let args: readonly unknown[] | undefined;

        try {
            ({ args } = decodeFunctionData({
                abi: sppReportProposalResultAbi,
                data: data as Hex,
            }));
        } catch {
            return undefined;
        }

        const [proposalId, stageId, resultType, tryAdvance] = args ?? [];

        if (
            typeof proposalId !== 'bigint' ||
            typeof stageId !== 'number' ||
            typeof resultType !== 'number' ||
            typeof tryAdvance !== 'boolean' ||
            !resultTypes.includes(resultType)
        ) {
            return undefined;
        }

        return { proposalId, stageId, resultType, tryAdvance };
    };

    decodeMultiSendCalls = (data: string | null): ISafeCall[] => {
        if (this.getSelector(data) !== safeMultiSendSelector) {
            return [];
        }

        try {
            const { args } = decodeFunctionData({
                abi: safeMultiSendAbi,
                data: data as Hex,
            });

            return this.unpackMultiSendCalls(args[0]);
        } catch {
            return [];
        }
    };

    private findReportInCall = (
        call: ISafeCall,
        target: {
            pluginAddress: string;
            proposalId: bigint;
            stageId: number;
        },
        depth = 0,
    ): ISafeProposalResultReport | undefined => {
        if (addressUtils.isAddressEqual(call.to, target.pluginAddress)) {
            const report = this.decodeProposalResultReport(call.data);

            if (
                report != null &&
                report.proposalId === target.proposalId &&
                report.stageId === target.stageId
            ) {
                return report;
            }
        }

        if (depth >= maxMultiSendDepth) {
            return undefined;
        }

        for (const innerCall of this.decodeMultiSendCalls(call.data)) {
            const report = this.findReportInCall(innerCall, target, depth + 1);

            if (report != null) {
                return report;
            }
        }

        return undefined;
    };

    private unpackMultiSendCalls = (packedCalls: Hex): ISafeCall[] => {
        const packed = packedCalls.slice(2);
        const calls: ISafeCall[] = [];
        let cursor = 0;

        while (cursor + multiSendHeaderLength <= packed.length) {
            const operation = Number.parseInt(
                packed.slice(cursor, cursor + 2),
                16,
            );
            const to = `0x${packed.slice(cursor + 2, cursor + 42)}`;
            const value = BigInt(`0x${packed.slice(cursor + 42, cursor + 106)}`);
            const dataLength = Number(
                BigInt(`0x${packed.slice(cursor + 106, cursor + 170)}`),
            );

            const dataStart = cursor + multiSendHeaderLength;
            const dataEnd = dataStart + dataLength * 2;

            if (dataEnd > packed.length) {
                return calls;
            }

            calls.push({
                to,
                operation,
                value,
                data: `0x${packed.slice(dataStart, dataEnd)}`,
            });
            cursor = dataEnd;
        }

        return calls;
    };

    private getSelector = (data: string | null): string | undefined =>
        data != null && data.length >= 10
            ? data.slice(0, 10).toLowerCase()
            : undefined;

    private normalizeProposalId = (proposalId: string | bigint): bigint =>
        typeof proposalId === 'bigint' ? proposalId : BigInt(proposalId);
}

export const safeMultisigTransactionUtils = new SafeMultisigTransactionUtils();
