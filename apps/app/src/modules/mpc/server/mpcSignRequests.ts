import 'server-only';
import {
    type Address,
    formatEther,
    type Hex,
    parseTransaction,
    recoverMessageAddress,
    recoverTransactionAddress,
    recoverTypedDataAddress,
    type TransactionSerialized,
    type TypedDataDefinition,
} from 'viem';
import type {
    IMpcCompleteRequestParams,
    IMpcCreateRequestParams,
    IMpcMember,
    IMpcPrepareTransactionResponse,
    IMpcSignRequest,
    IMpcSignRequestSummary,
    IMpcTransactionPayload,
    IMpcUser,
    MpcSignRequestPayload,
} from '@/modules/mpc/api/mpcService/domain';
import { appendActivity } from './mpcActivity';
import { MpcApiError } from './mpcApiError';
import { mpcChain } from './mpcChain';
import { evaluatePolicy } from './mpcPolicy';
import {
    getMpcStore,
    type IMpcStoreData,
    type IMpcStoreSystem,
    nowIso,
} from './mpcStore';
import { serverCrypto } from './serverCrypto';

/**
 * Sign requests module of the POC co-signer: creation (summary + policy decision), approvals, share release
 * bookkeeping, transaction preparation and completion (signature verification + broadcast).
 */

const MAX_REQUESTS_PER_SYSTEM = 500;
const GAS_BUFFER_NUMERATOR = BigInt(120);
const GAS_BUFFER_DENOMINATOR = BigInt(100);

const truncate = (value: string, max = 48): string =>
    value.length > max ? `${value.slice(0, max)}…` : value;

const shortAddress = (address: Address): string =>
    `${address.slice(0, 6)}…${address.slice(-4)}`;

const isContractCall = (data?: Hex): boolean =>
    data != null && data !== '0x' && data.length > 2;

const parseTypedData = (typedDataJson: string): TypedDataDefinition =>
    JSON.parse(typedDataJson) as TypedDataDefinition;

/**
 * Builds the human readable summary shown to approvers and signers (anti blind-signing).
 */
export const buildRequestSummary = (
    payload: MpcSignRequestPayload,
): IMpcSignRequestSummary => {
    if (payload.type === 'transaction') {
        const { transaction } = payload;
        const contractCall = isContractCall(transaction.data);
        const value = `${formatEther(BigInt(transaction.valueWei))} ETH`;
        const selector = contractCall
            ? (transaction.data!.slice(0, 10) as Hex)
            : undefined;
        const label = contractCall
            ? `Call ${shortAddress(transaction.to)} (${selector!}) with ${value}`
            : `Send ${value} to ${shortAddress(transaction.to)}`;

        return {
            label,
            chainId: transaction.chainId,
            to: transaction.to,
            valueWei: transaction.valueWei,
            selector,
            isContractCall: contractCall,
        };
    }

    if (payload.type === 'message') {
        return {
            label: `Sign message "${truncate(payload.message.message)}"`,
        };
    }

    let primaryType = 'unknown';

    try {
        primaryType = String(
            parseTypedData(payload.typedData.typedDataJson).primaryType,
        );
    } catch {
        // Validated upstream, keep the fallback label.
    }

    return { label: `Sign typed data (${primaryType})` };
};

const requireRequestRecord = (
    data: IMpcStoreData,
    systemId: string,
    requestId: string,
): IMpcSignRequest => {
    const request = data.signRequests.find(
        (item) => item.id === requestId && item.systemId === systemId,
    );

    if (request == null) {
        throw new MpcApiError('not_found', 'Request not found.');
    }

    return request;
};

const isRequesterOrOwner = (
    request: IMpcSignRequest,
    user: IMpcUser,
    member: IMpcMember,
): boolean => request.createdBy === user.username || member.role === 'owner';

const assertRequesterOrOwner = (
    request: IMpcSignRequest,
    user: IMpcUser,
    member: IMpcMember,
): void => {
    if (!isRequesterOrOwner(request, user, member)) {
        throw new MpcApiError(
            'forbidden',
            'Only the requester or an owner can perform this action.',
        );
    }
};

export const listRequests = (systemId: string): IMpcSignRequest[] =>
    getMpcStore()
        .read()
        .signRequests.filter((item) => item.systemId === systemId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const findRequest = (
    systemId: string,
    requestId: string,
): IMpcSignRequest | undefined =>
    getMpcStore()
        .read()
        .signRequests.find(
            (item) => item.id === requestId && item.systemId === systemId,
        );

/**
 * Builds the request record (summary + policy decision) from the current store state without persisting it.
 */
const buildRequest = (
    data: IMpcStoreData,
    system: IMpcStoreSystem,
    actor: IMpcUser,
    params: IMpcCreateRequestParams,
    id: string,
): IMpcSignRequest => {
    if (system.status !== 'active') {
        throw new MpcApiError('conflict', 'The system has no active key.');
    }

    const history = data.signRequests.filter(
        (item) => item.systemId === system.id,
    );

    if (history.length >= MAX_REQUESTS_PER_SYSTEM) {
        throw new MpcApiError('conflict', 'Too many requests for this system.');
    }

    const policyDecision = evaluatePolicy(
        system.policy,
        params.payload,
        history,
    );
    const approvalsRequired = policyDecision.requiresApproval
        ? system.policy.approvalsRequired
        : 0;

    let status: IMpcSignRequest['status'] = 'approved';

    if (!policyDecision.allowed) {
        status = 'rejected';
    } else if (approvalsRequired > 0) {
        status = 'pending_approval';
    }

    const now = nowIso();

    return {
        id,
        systemId: system.id,
        type: params.payload.type,
        payload: params.payload,
        summary: buildRequestSummary(params.payload),
        status,
        policyDecision,
        approvals: [],
        rejections: [],
        approvalsRequired,
        createdBy: actor.username,
        createdAt: now,
        updatedAt: now,
        error: policyDecision.allowed
            ? undefined
            : policyDecision.reasons.join(' '),
    };
};

export const MPC_PREVIEW_REQUEST_ID = 'preview';

/**
 * Creates a sign request (or, with dryRun, previews the summary and policy decision without persisting).
 */
export const createRequest = (
    system: IMpcStoreSystem,
    actor: IMpcUser,
    params: IMpcCreateRequestParams,
): IMpcSignRequest => {
    if (params.dryRun) {
        return buildRequest(
            getMpcStore().read(),
            system,
            actor,
            params,
            MPC_PREVIEW_REQUEST_ID,
        );
    }

    return getMpcStore().update((data) => {
        const request = buildRequest(
            data,
            system,
            actor,
            params,
            serverCrypto.randomId(),
        );
        const { status, policyDecision } = request;

        data.signRequests.push(request);

        appendActivity(data, {
            systemId: system.id,
            actor: actor.username,
            type: 'request_created',
            data: {
                requestId: request.id,
                type: request.type,
                label: request.summary.label,
                status,
                reasons: policyDecision.reasons,
            },
        });

        return request;
    });
};

export const approveRequest = (
    systemId: string,
    requestId: string,
    actor: IMpcUser,
): IMpcSignRequest =>
    getMpcStore().update((data) => {
        const request = requireRequestRecord(data, systemId, requestId);

        if (request.status !== 'pending_approval') {
            throw new MpcApiError(
                'conflict',
                'Request is not pending approval.',
            );
        }

        if (request.createdBy === actor.username) {
            throw new MpcApiError(
                'forbidden',
                'The requester cannot approve their own request.',
            );
        }

        if (request.approvals.some((item) => item.userId === actor.id)) {
            throw new MpcApiError(
                'conflict',
                'You already approved this request.',
            );
        }

        const now = nowIso();
        request.approvals.push({
            userId: actor.id,
            username: actor.username,
            at: now,
        });
        request.updatedAt = now;

        if (request.approvals.length >= request.approvalsRequired) {
            request.status = 'approved';
        }

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'request_approved',
            data: {
                requestId,
                approvals: request.approvals.length,
                approvalsRequired: request.approvalsRequired,
                status: request.status,
            },
        });

        return request;
    });

export const rejectRequest = (
    systemId: string,
    requestId: string,
    actor: IMpcUser,
): IMpcSignRequest =>
    getMpcStore().update((data) => {
        const request = requireRequestRecord(data, systemId, requestId);

        // Released requests can be rejected too: it frees the value reserved against the daily limit when the
        // signing flow was abandoned (the request can no longer be completed afterwards).
        if (
            request.status !== 'pending_approval' &&
            request.status !== 'approved' &&
            request.status !== 'released'
        ) {
            throw new MpcApiError(
                'conflict',
                'Request can no longer be rejected.',
            );
        }

        const now = nowIso();
        request.rejections.push({
            userId: actor.id,
            username: actor.username,
            at: now,
        });
        request.status = 'rejected';
        request.updatedAt = now;

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'request_rejected',
            data: { requestId },
        });

        return request;
    });

/**
 * Marks a request as released (called inside the server-share mutation). The request must be approved, or already
 * released when the same authorized caller retries the signing flow.
 */
export const markRequestReleased = (
    data: IMpcStoreData,
    systemId: string,
    requestId: string,
    actor: IMpcUser,
    member: IMpcMember,
): IMpcSignRequest => {
    const request = requireRequestRecord(data, systemId, requestId);
    assertRequesterOrOwner(request, actor, member);

    if (request.status !== 'approved' && request.status !== 'released') {
        throw new MpcApiError(
            'conflict',
            `Request must be approved to release the server share (current status: ${request.status}).`,
        );
    }

    const now = nowIso();
    request.status = 'released';
    request.releasedAt ??= now;
    request.updatedAt = now;

    return request;
};

/**
 * Computes the unsigned EIP-1559 transaction fields (nonce, gas, fees) via RPC.
 */
export const prepareTransaction = async (
    system: IMpcStoreSystem,
    requestId: string,
    actor: IMpcUser,
    member: IMpcMember,
): Promise<IMpcPrepareTransactionResponse> => {
    const request = findRequest(system.id, requestId);

    if (request == null) {
        throw new MpcApiError('not_found', 'Request not found.');
    }

    assertRequesterOrOwner(request, actor, member);

    if (request.payload.type !== 'transaction') {
        throw new MpcApiError(
            'validation_error',
            'Only transaction requests can be prepared.',
        );
    }

    if (request.status !== 'approved' && request.status !== 'released') {
        throw new MpcApiError('conflict', 'Request is not ready to be signed.');
    }

    if (system.address == null) {
        throw new MpcApiError('conflict', 'The system has no key.');
    }

    const { transaction } = request.payload;
    mpcChain.assertSupportedChain(transaction.chainId);

    const value = BigInt(transaction.valueWei);
    const [nonce, gas, fees] = await Promise.all([
        mpcChain.getTransactionCount(system.address),
        mpcChain.estimateGas({
            from: system.address,
            to: transaction.to,
            value,
            data: transaction.data,
        }),
        mpcChain.estimateFeesPerGas(),
    ]);

    const gasWithBuffer = (gas * GAS_BUFFER_NUMERATOR) / GAS_BUFFER_DENOMINATOR;

    return {
        chainId: transaction.chainId,
        nonce,
        to: transaction.to,
        valueWei: transaction.valueWei,
        data: transaction.data,
        gas: gasWithBuffer.toString(),
        maxFeePerGasWei: fees.maxFeePerGas.toString(),
        maxPriorityFeePerGasWei: fees.maxPriorityFeePerGas.toString(),
    };
};

const assertSignedTransactionMatches = (
    signedTransaction: Hex,
    expected: IMpcTransactionPayload,
): void => {
    let parsed: ReturnType<typeof parseTransaction>;

    try {
        parsed = parseTransaction(signedTransaction);
    } catch {
        throw new MpcApiError(
            'validation_error',
            'Signed transaction cannot be parsed.',
        );
    }

    const expectedData = expected.data ?? '0x';
    const parsedData = parsed.data ?? '0x';
    const parsedValue = parsed.value ?? BigInt(0);

    const mismatches: string[] = [];

    if (parsed.chainId !== expected.chainId) {
        mismatches.push('chainId');
    }

    if (parsed.to?.toLowerCase() !== expected.to.toLowerCase()) {
        mismatches.push('to');
    }

    if (parsedValue !== BigInt(expected.valueWei)) {
        mismatches.push('value');
    }

    if (parsedData.toLowerCase() !== expectedData.toLowerCase()) {
        mismatches.push('data');
    }

    if (mismatches.length > 0) {
        throw new MpcApiError(
            'validation_error',
            `Signed transaction does not match the request (${mismatches.join(', ')}).`,
        );
    }
};

const verifySigner = async (
    request: IMpcSignRequest,
    params: IMpcCompleteRequestParams,
    expectedAddress: Address,
): Promise<void> => {
    let recovered: Address;

    try {
        if (request.payload.type === 'transaction') {
            if (params.signedTransaction == null) {
                throw new MpcApiError(
                    'validation_error',
                    '"signedTransaction" is required for transaction requests.',
                );
            }

            assertSignedTransactionMatches(
                params.signedTransaction,
                request.payload.transaction,
            );
            recovered = await recoverTransactionAddress({
                serializedTransaction:
                    params.signedTransaction as TransactionSerialized,
            });
        } else if (request.payload.type === 'message') {
            recovered = await recoverMessageAddress({
                message: request.payload.message.message,
                signature: params.signature,
            });
        } else {
            const typedData = parseTypedData(
                request.payload.typedData.typedDataJson,
            );
            recovered = await recoverTypedDataAddress({
                ...typedData,
                signature: params.signature,
            });
        }
    } catch (error) {
        if (error instanceof MpcApiError) {
            throw error;
        }

        throw new MpcApiError(
            'validation_error',
            'Signature cannot be verified.',
        );
    }

    if (recovered.toLowerCase() !== expectedAddress.toLowerCase()) {
        throw new MpcApiError(
            'validation_error',
            'Signature does not match the system address.',
        );
    }
};

const setRequestFailed = (
    systemId: string,
    requestId: string,
    actor: IMpcUser,
    error: string,
): void => {
    getMpcStore().update((data) => {
        const request = requireRequestRecord(data, systemId, requestId);
        request.status = 'failed';
        request.error = error;
        request.updatedAt = nowIso();

        appendActivity(data, {
            systemId,
            actor: actor.username,
            type: 'request_failed',
            data: { requestId, error },
        });
    });
};

/**
 * Completes a released request: verifies the signature against the system address (and, for transactions, that
 * the signed transaction matches the request) then broadcasts transactions to Sepolia. Failures mark the request
 * as failed and are returned as API errors.
 */
export const completeRequest = async (
    system: IMpcStoreSystem,
    requestId: string,
    actor: IMpcUser,
    member: IMpcMember,
    params: IMpcCompleteRequestParams,
): Promise<IMpcSignRequest> => {
    const request = findRequest(system.id, requestId);

    if (request == null) {
        throw new MpcApiError('not_found', 'Request not found.');
    }

    assertRequesterOrOwner(request, actor, member);

    if (request.status !== 'released') {
        throw new MpcApiError(
            'conflict',
            `Request must be in "released" status to complete (current status: ${request.status}).`,
        );
    }

    if (system.address == null) {
        throw new MpcApiError('conflict', 'The system has no key.');
    }

    try {
        await verifySigner(request, params, system.address);
    } catch (error) {
        const message =
            error instanceof Error ? error.message : 'Verification failed.';
        setRequestFailed(system.id, requestId, actor, message);
        throw error;
    }

    let txHash: Hex | undefined;

    if (request.payload.type === 'transaction') {
        mpcChain.assertSupportedChain(request.payload.transaction.chainId);

        try {
            txHash = await mpcChain.sendRawTransaction(
                params.signedTransaction!,
            );
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Broadcast failed.';
            setRequestFailed(system.id, requestId, actor, message);
            throw error;
        }
    }

    return getMpcStore().update((data) => {
        const record = requireRequestRecord(data, system.id, requestId);
        const now = nowIso();
        record.signature = params.signature;
        record.txHash = txHash;
        record.status = txHash != null ? 'broadcast' : 'signed';
        record.updatedAt = now;

        appendActivity(data, {
            systemId: system.id,
            actor: actor.username,
            type: txHash != null ? 'request_broadcast' : 'request_signed',
            data: { requestId, txHash, label: record.summary.label },
        });

        return record;
    });
};
