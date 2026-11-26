import { addressUtils } from '@aragon/gov-ui-kit';
import { fromHex, isHex } from 'viem';
import type { Network } from '@/shared/api/daoService';
import type { IProposalAction } from '../../api/governanceService';
import type { useDecodeTransaction } from '../../api/smartContractService';
import {
    type ISession,
    type ISessionRequest,
    type ISessionRequestParams,
    walletConnectService,
} from '../../api/walletConnectService';

export interface ISessionRequestToActionParams {
    /**
     * Request received from the connected dApp.
     */
    sessionRequest: ISessionRequest;
    /**
     * Active session the request must belong to.
     */
    session: ISession;
    /**
     * Address of the account the dApp is connected to.
     */
    address: string;
    /**
     * Network of the account.
     */
    network: Network;
    /**
     * Async function to decode the transaction.
     */
    decodeTransactionAsync: ReturnType<
        typeof useDecodeTransaction
    >['mutateAsync'];
}

export interface IDecodeRawActionParams
    extends Omit<ISessionRequestToActionParams, 'sessionRequest' | 'session'> {
    /**
     * Raw action to be decoded.
     */
    rawAction: IProposalAction;
}

class WalletConnectActionDialogUtils {
    sessionRequestToAction = async (
        params: ISessionRequestToActionParams,
    ): Promise<IProposalAction | undefined> => {
        const { sessionRequest, session, address, network } = params;
        const { request, chainId } = sessionRequest.params;

        // Only sendTransaction session requests are currently supported
        if (request.method !== 'eth_sendTransaction') {
            return;
        }

        const rawAction = this.requestParamsToRawAction(
            request.params as ISessionRequestParams[typeof request.method],
        );

        // Ignore requests from other sessions, for other chains or other senders, as the action would be executed
        // by the given account on the given network
        const isValidRequest =
            sessionRequest.topic === session.topic &&
            chainId === walletConnectService.getChainNamespace(network) &&
            addressUtils.isAddressEqual(rawAction.from, address);

        if (!isValidRequest) {
            return;
        }

        try {
            const decodedAction = await this.decodeRawAction({
                ...params,
                rawAction,
            });
            return decodedAction;
        } catch {
            // Silently ignore eventual errors and just return the raw action when decode function fails.
            return rawAction;
        }
    };

    private requestParamsToRawAction = (
        params: ISessionRequestParams['eth_sendTransaction'],
    ): IProposalAction => {
        const { from, to, data, value } = params[0];
        const parsedValue = this.parseRequestValue(value);

        return {
            from,
            to,
            data,
            value: parsedValue,
            type: 'unknown',
            inputData: null,
        };
    };

    // Request value might be set as hex instead of number
    private parseRequestValue = (value = '0') =>
        isHex(value) ? fromHex(value, 'bigint').toString() : value;

    private decodeRawAction = async (params: IDecodeRawActionParams) => {
        const { network, decodeTransactionAsync, rawAction } = params;

        const { to, ...body } = rawAction;
        const urlParams = { network, address: to };
        const decodedAction = await decodeTransactionAsync({ urlParams, body });

        return decodedAction;
    };
}

export const walletConnectActionDialogUtils =
    new WalletConnectActionDialogUtils();
