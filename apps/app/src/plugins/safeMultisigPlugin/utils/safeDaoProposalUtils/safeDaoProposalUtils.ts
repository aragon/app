import { addressUtils } from '@aragon/gov-ui-kit';
import { decodeFunctionData, type Hex, toFunctionSelector } from 'viem';
import {
    type ISafeCall,
    isSafeMultiSendDelegateCall,
    maxSafeBatchDepth,
    SafeBatchStatus,
    safeTransactionEnvelopeUtils,
} from '@/modules/safe/utils/safeTransactionEnvelopeUtils';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import { globalExecutorAbi } from '@/shared/utils/transactionUtils/globalExecutorAbi';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils/transactionUtils.api';

export interface IFindDaoExecuteActionsParams {
    /**
     * Safe transaction to inspect, including any MultiSend batch it carries.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Address of the DAO the `execute` call must target.
     */
    daoAddress: string;
}

const executeSelector = toFunctionSelector(globalExecutorAbi[0]);

/**
 * Identifies the Safe transactions that are governance proposals of a native Safe process: the
 * ones whose payload is `DAO.execute(callId, actions, allowFailureMap)` on the process's target
 * DAO.
 *
 * A Safe's queue and history are account-wide, so membership is proven, never assumed. Both the
 * target and the calldata are verified: the matched call must be a plain `CALL` to the DAO whose
 * selector is `execute` and whose arguments decode. A call to the DAO with any other selector, an
 * `execute` to any other address, or a delegate call is not a DAO proposal. Reports batched
 * through MultiSend are unpacked and walked to the same depth bound as every other Safe caller, so
 * an `execute` bundled with unrelated calls is still found.
 *
 * Nothing here throws: a malformed or truncated payload is simply "not a DAO proposal", so a
 * hostile row can never take the list down with it.
 */
class SafeDaoProposalUtils {
    /**
     * The DAO actions carried by every `execute` call in the transaction, or undefined when the
     * transaction is not a proposal on `daoAddress`.
     */
    findDaoExecuteActions = (
        params: IFindDaoExecuteActionsParams,
    ): ITransactionRequest[] | undefined => {
        const { transaction, daoAddress } = params;

        return this.findExecuteInCall(
            safeTransactionEnvelopeUtils.getCall(transaction),
            daoAddress,
            0,
        );
    };

    isDaoProposal = (params: IFindDaoExecuteActionsParams): boolean =>
        this.findDaoExecuteActions(params) != null;

    private findExecuteInCall = (
        call: ISafeCall,
        daoAddress: string,
        depth: number,
    ): ITransactionRequest[] | undefined => {
        if (
            call.operation === 0 &&
            addressUtils.isAddressEqual(call.to, daoAddress)
        ) {
            return this.decodeExecuteActions(call.data);
        }

        if (depth >= maxSafeBatchDepth || !isSafeMultiSendDelegateCall(call)) {
            return undefined;
        }

        const inspection = safeTransactionEnvelopeUtils.inspectBatch(call.data);

        if (inspection.status !== SafeBatchStatus.COMPLETE) {
            return undefined;
        }

        const actions: ITransactionRequest[] = [];
        let foundExecute = false;

        for (const innerCall of inspection.calls) {
            const innerActions = this.findExecuteInCall(
                innerCall,
                daoAddress,
                depth + 1,
            );

            if (innerActions != null) {
                foundExecute = true;
                actions.push(...innerActions);
            }
        }

        return foundExecute ? actions : undefined;
    };

    private decodeExecuteActions = (
        data: string | null,
    ): ITransactionRequest[] | undefined => {
        if (this.getSelector(data) !== executeSelector) {
            return undefined;
        }

        try {
            const { args } = decodeFunctionData({
                abi: globalExecutorAbi,
                data: data as Hex,
            });
            const [, actions] = args;

            return actions.map((action) => ({
                to: action.to,
                value: action.value,
                data: action.data,
            }));
        } catch {
            return undefined;
        }
    };

    private getSelector = (data: string | null): string | undefined =>
        data != null && data.length >= 10
            ? data.slice(0, 10).toLowerCase()
            : undefined;
}

export const safeDaoProposalUtils = new SafeDaoProposalUtils();
