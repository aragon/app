/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import { fromHex, isHex } from 'viem';
import type { Network } from '@/shared/api/daoService';
import type { IProposalAction } from '../../api/governanceService';
import type { useDecodeTransaction } from '../../api/smartContractService';
import type {
    ISessionRequest,
    ISessionRequestParams,
} from '../../api/walletConnectService';

export interface ISessionRequestToActionParams {
    /**
     * Request received from the connected dApp.
     */
    sessionRequest: ISessionRequest;
    /**
     * Address of the DAO.
     */
    daoAddress: string;
    /**
     * Network of the DAO.
     */
    daoNetwork: Network;
    /**
     * Async function to decode the transaction.
     */
    decodeTransactionAsync: ReturnType<
        typeof useDecodeTransaction
    >['mutateAsync'];
}

export interface IDecodeRawActionParams
    extends Omit<ISessionRequestToActionParams, 'sessionRequest'> {
    /**
     * Raw action to be decoded.
     */
    rawAction: IProposalAction;
}

class WalletConnectActionDialogUtils {
    sessionRequestToAction = async (
        params: ISessionRequestToActionParams,
    ): Promise<IProposalAction | undefined> => {
        const { request } = params.sessionRequest.params;

        // DEBUG: Log incoming request
        console.log('=== WalletConnect Session Request ===');
        console.log('Method:', request.method);
        console.log('Params:', JSON.stringify(request.params, null, 2));

        // Only sendTransaction session requests are currently supported
        if (request.method !== 'eth_sendTransaction') {
            console.log('Skipping non-sendTransaction method:', request.method);
            return;
        }

        const rawAction = this.requestParamsToRawAction(
            request.params as ISessionRequestParams[typeof request.method],
        );

        // DEBUG: Log raw action after parsing
        console.log('=== Raw Action (after parsing) ===');
        console.log('to:', rawAction.to);
        console.log('data:', rawAction.data);
        console.log('value:', rawAction.value);

        try {
            const decodedAction = await this.decodeRawAction({
                ...params,
                rawAction,
            });

            // DEBUG: Log decoded action
            console.log('=== Decoded Action ===');
            console.log('type:', decodedAction.type);
            console.log('data:', decodedAction.data);
            console.log('Full:', JSON.stringify(decodedAction, null, 2));

            return decodedAction;
        } catch (error) {
            // DEBUG: Log decode error
            console.log('=== Decode Error ===', error);
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
        const { daoNetwork, decodeTransactionAsync, rawAction } = params;

        const { to, ...body } = rawAction;
        const urlParams = { network: daoNetwork, address: to };
        const decodedAction = await decodeTransactionAsync({ urlParams, body });

        return decodedAction;
    };
}

export const walletConnectActionDialogUtils =
    new WalletConnectActionDialogUtils();
