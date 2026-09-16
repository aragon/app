import { addressUtils } from '@aragon/gov-ui-kit';
import {
    type AbiFunction,
    decodeFunctionData,
    encodeFunctionData,
    getAbiItem,
    type Hex,
    toFunctionSelector,
} from 'viem';
import {
    type ISafeCall,
    maxSafeBatchDepth,
    safeTransactionEnvelopeUtils,
} from '@/modules/safe/utils/safeTransactionEnvelopeUtils';
import { sppReportProposalResultAbi } from '@/plugins/sppPlugin/dialogs/sppReportProposalResultDialog/sppReportProposalResultAbi';
import { SppProposalType } from '@/plugins/sppPlugin/types';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import type { ISafeProposalResultReport } from '../../types';

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

const isSppProposalType = (value: number): value is SppProposalType =>
    [
        SppProposalType.NONE,
        SppProposalType.APPROVAL,
        SppProposalType.VETO,
    ].includes(value as SppProposalType);

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

        // `_tryAdvance` stays false: it separates reporting from advancement and preserves the
        // chance to correct a wrong report before progression becomes irreversible. Advancing
        // closes that effective recovery window - it does not make a later report revert, and an
        // advance by any other authorized actor closes the window just the same.
        return encodeFunctionData({
            abi: sppReportProposalResultAbi,
            functionName: 'reportProposalResult',
            args: [
                this.normalizeProposalId(proposalId),
                stageId,
                resultType,
                false,
            ],
        });
    };

    findProposalResultReport = (
        params: IFindProposalResultReportParams,
    ): ISafeProposalResultReport | undefined => {
        const { transaction, pluginAddress, proposalId, stageId } = params;

        const call = safeTransactionEnvelopeUtils.getCall(transaction);

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
            !isSppProposalType(resultType)
        ) {
            return undefined;
        }

        return { proposalId, stageId, resultType, tryAdvance };
    };

    /**
     * Calls carried by a batch, if the data is one. A truncated batch yields the prefix that did
     * unpack: a report found there is still a report, and one hidden behind the truncation is
     * simply not found — the payload review in the account surface is what states the difference.
     */
    decodeMultiSendCalls = (data: string | null): ISafeCall[] =>
        safeTransactionEnvelopeUtils.inspectBatch(data).calls;

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

        if (depth >= maxSafeBatchDepth) {
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

    private getSelector = (data: string | null): string | undefined =>
        data != null && data.length >= 10
            ? data.slice(0, 10).toLowerCase()
            : undefined;

    private normalizeProposalId = (proposalId: string | bigint): bigint =>
        typeof proposalId === 'bigint' ? proposalId : BigInt(proposalId);
}

export const safeMultisigTransactionUtils = new SafeMultisigTransactionUtils();
