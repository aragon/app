import {
    type Hex,
    hashMessage,
    hashTypedData,
    keccak256,
    serializeTransaction,
    type TypedDataDefinition,
} from 'viem';
import type {
    IMpcPrepareTransactionResponse,
    IMpcSignRequest,
} from '@/modules/mpc/api/mpcService/domain';
import { buildMpcTransaction } from '@/modules/mpc/providers/mockShamirProvider';

/**
 * Computes the digest that will actually be signed for a request (EIP-191 for messages, EIP-712 for typed data,
 * keccak256 of the unsigned serialized EIP-1559 transaction) so it can be shown before confirming the signature
 * (anti blind-signing). Returns undefined when it cannot be computed (invalid typed data, missing prepared tx).
 */
export const computeMpcSigningHash = (
    request: IMpcSignRequest,
    preparedTransaction?: IMpcPrepareTransactionResponse,
): Hex | undefined => {
    const { payload } = request;

    try {
        if (payload.type === 'message') {
            return hashMessage(payload.message.message);
        }

        if (payload.type === 'typedData') {
            const typedData = JSON.parse(
                payload.typedData.typedDataJson,
            ) as TypedDataDefinition;

            return hashTypedData(typedData);
        }

        if (preparedTransaction == null) {
            return undefined;
        }

        return keccak256(
            serializeTransaction(buildMpcTransaction(preparedTransaction)),
        );
    } catch {
        return undefined;
    }
};
