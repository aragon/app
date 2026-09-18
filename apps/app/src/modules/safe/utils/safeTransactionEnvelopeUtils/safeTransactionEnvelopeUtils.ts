import { calculateSafeTransactionHash } from '@safe-global/protocol-kit';
import { decodeFunctionData, type Hex, hashDomain, hashStruct } from 'viem';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import { safeMultiSendAbi, safeMultiSendSelector } from './safeMultiSendAbi';

/**
 * Single call carried by a Safe transaction, either the transaction itself or one of the calls
 * unpacked from a MultiSend batch.
 */
export interface ISafeCall {
    /**
     * Target address of the call.
     */
    to: string;
    /**
     * Calldata of the call, or null for a plain value transfer.
     */
    data: string | null;
    /**
     * Call type: 0 for `CALL`, 1 for `DELEGATECALL`.
     */
    operation: number;
    /**
     * Native value transferred by the call.
     */
    value: bigint;
}

export enum SafeBatchStatus {
    /**
     * The call does not carry a MultiSend batch: it is the single call it appears to be.
     */
    NOT_A_BATCH = 'NOT_A_BATCH',
    /**
     * Every packed call was unpacked and the payload ended cleanly.
     */
    COMPLETE = 'COMPLETE',
    /**
     * A MultiSend payload whose packed calls do not add up: a declared length runs past the end of
     * the payload, or trailing bytes remain that are too short to be another call. The unpacked
     * calls are a prefix of what the batch claims to do and must never be presented as the whole
     * batch.
     */
    TRUNCATED = 'TRUNCATED',
    /**
     * The MultiSend selector is present but the payload does not decode as `multiSend(bytes)`.
     */
    UNRECOGNIZED = 'UNRECOGNIZED',
}

export interface ISafeBatchInspection {
    /**
     * Status of the batch the inspected call carries.
     */
    status: SafeBatchStatus;
    /**
     * Calls unpacked from the batch, in execution order. Empty unless the status is `COMPLETE` or
     * `TRUNCATED`, and a prefix of the batch when `TRUNCATED`.
     */
    calls: ISafeCall[];
}

export enum SafeHashVerification {
    /**
     * The envelope hashes to the `safeTxHash` the service reported.
     */
    MATCH = 'MATCH',
    /**
     * The envelope hashes to something else: its fields and its identity disagree, so nothing about
     * it can be signed.
     */
    MISMATCH = 'MISMATCH',
    /**
     * The hash cannot be computed, so the envelope is neither proven nor disproven. Happens when
     * the Safe version is unknown or the nonce exceeds what the hash helper accepts.
     */
    UNVERIFIABLE = 'UNVERIFIABLE',
}

export interface IVerifySafeTransactionHashParams {
    /**
     * Transaction as reported by the Safe transaction service.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Address of the Safe the transaction belongs to.
     */
    safeAddress: string;
    /**
     * Contract version of the Safe. The EIP-712 domain changed across versions, so the hash cannot
     * be computed without it.
     */
    safeVersion: string | null;
    /**
     * Chain the Safe is deployed on.
     */
    chainId: bigint;
}

export interface ISafeTransactionHashVerification {
    /**
     * Outcome of comparing the computed hash with the reported one.
     */
    verification: SafeHashVerification;
    /**
     * Hash computed from the envelope fields. Undefined when it could not be computed.
     */
    computedHash?: string;
}

/**
 * Domain a Safe v1.3.0+ signs under: chain and Safe address only, no name or version. Passed
 * explicitly because the domain type is itself part of the hash.
 */
const safeDomainTypes = {
    EIP712Domain: [
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
    ],
} as const;

/**
 * EIP-712 struct the Safe signs. Field order is part of the type hash, so it mirrors the contract
 * exactly and must not be reordered.
 */
const safeTxTypes = {
    SafeTx: [
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'data', type: 'bytes' },
        { name: 'operation', type: 'uint8' },
        { name: 'safeTxGas', type: 'uint256' },
        { name: 'baseGas', type: 'uint256' },
        { name: 'gasPrice', type: 'uint256' },
        { name: 'gasToken', type: 'address' },
        { name: 'refundReceiver', type: 'address' },
        { name: 'nonce', type: 'uint256' },
    ],
} as const;

export interface ISafeVerificationHashes {
    /**
     * Outcome of comparing the locally computed `safeTxHash` with the reported one.
     */
    verification: SafeHashVerification;
    /**
     * Locally computed `safeTxHash`. Undefined when it could not be computed.
     */
    safeTxHash?: string;
    /**
     * EIP-712 domain hash, as a hardware wallet displays it. Undefined for a Safe whose version
     * is unknown or predates `chainId` in the domain.
     */
    domainHash?: string;
    /**
     * EIP-712 hash of the `SafeTx` struct, as a hardware wallet displays it.
     */
    messageHash?: string;
}

/**
 * The transaction an owner is asked to sign, field for field. Amounts stay strings: a wei value or
 * a gas price does not survive a JS number, and the signed envelope must read back exactly.
 */
export interface ISafeTransactionEnvelope {
    to: string;
    value: string;
    data: string;
    operation: number;
    safeTxGas: string;
    baseGas: string;
    gasPrice: string;
    gasToken: string;
    refundReceiver: string;
    nonce: string;
}

// Each packed MultiSend call is operation (1 byte) + to (20) + value (32) + data length (32),
// expressed here in hex characters.
const multiSendHeaderLength = 2 + 40 + 64 + 64;

/**
 * Batches nest in theory but never deeply in practice; the cap bounds a hostile payload. Exported
 * so every caller that walks a batch stops at the same depth.
 */
export const maxSafeBatchDepth = 4;

/**
 * Reconstruction and inspection of the exact Safe transaction an owner signs: its envelope, its
 * hash identity, and the calls it actually carries.
 *
 * Deliberately account-level and free of governance meaning. Whether a call reports a proposal
 * result is the governance plugin's question; whether the payload is the one being signed is this
 * module's.
 */
class SafeTransactionEnvelopeUtils {
    /**
     * Rebuilds the signed envelope from a service transaction.
     */
    getEnvelope = (
        transaction: ISafeMultisigTransaction,
    ): ISafeTransactionEnvelope => ({
        to: transaction.to,
        value: transaction.value,
        data: transaction.data ?? '0x',
        operation: transaction.operation,
        safeTxGas: transaction.safeTxGas,
        baseGas: transaction.baseGas,
        gasPrice: transaction.gasPrice,
        gasToken: transaction.gasToken,
        refundReceiver: transaction.refundReceiver,
        nonce: transaction.nonce,
    });

    /**
     * The transaction as a single call, which is what it is until proven to be a batch.
     */
    getCall = (transaction: ISafeMultisigTransaction): ISafeCall => ({
        to: transaction.to,
        data: transaction.data,
        operation: transaction.operation,
        value: BigInt(transaction.value),
    });

    /**
     * Recomputes the hash from the envelope and compares it with the reported `safeTxHash`.
     *
     * The service is trusted for discovery, not for authorisation: a transaction whose fields hash
     * to something else is not the transaction its hash identifies, and signing either of them
     * authorises the wrong thing.
     *
     * What a MATCH does not prove: the envelope, the reported `safeTxHash` and `safeVersion` all
     * arrive from the same backend, so this detects an inconsistent response, not a dishonest
     * one. A coherent malicious envelope matches its own hash. Reading `VERSION()` from chain
     * would remove one of those inputs from the trusted set (W11).
     */
    verifyTransactionHash = (
        params: IVerifySafeTransactionHashParams,
    ): ISafeTransactionHashVerification => {
        const { transaction, safeAddress, safeVersion, chainId } = params;

        if (safeVersion == null) {
            return { verification: SafeHashVerification.UNVERIFIABLE };
        }

        const nonce = Number(transaction.nonce);

        if (!Number.isSafeInteger(nonce) || nonce < 0) {
            return { verification: SafeHashVerification.UNVERIFIABLE };
        }

        let computedHash: string;

        try {
            computedHash = calculateSafeTransactionHash(
                safeAddress,
                {
                    ...this.getEnvelope(transaction),
                    operation: transaction.operation,
                    nonce,
                },
                safeVersion,
                chainId,
            );
        } catch {
            return { verification: SafeHashVerification.UNVERIFIABLE };
        }

        const verification =
            computedHash.toLowerCase() === transaction.safeTxHash.toLowerCase()
                ? SafeHashVerification.MATCH
                : SafeHashVerification.MISMATCH;

        return { verification, computedHash };
    };

    /**
     * The three hashes a signer can compare, computed here from the envelope rather than taken
     * from any response.
     *
     * A hardware wallet shows the **domain hash** and the **message hash**, not the `safeTxHash`,
     * so an owner cannot check a Safe transaction against a device unless the app shows those two.
     * Both are derived locally: `domainHash` from the Safe address, chain and version, and
     * `messageHash` from the envelope fields. Undefined when the version is unknown, because the
     * EIP-712 domain changed across versions and a hash computed from the wrong domain is worse
     * than no hash.
     *
     * `chainId` entered the domain in Safe v1.3.0. For an earlier Safe the domain is
     * `verifyingContract` only, so these are returned undefined rather than computed from a
     * domain that version never used.
     */
    getVerificationHashes = (
        params: IVerifySafeTransactionHashParams,
    ): ISafeVerificationHashes => {
        const { transaction, safeAddress, safeVersion, chainId } = params;
        const { verification, computedHash } =
            this.verifyTransactionHash(params);

        if (safeVersion == null || !this.hasChainIdInDomain(safeVersion)) {
            return { verification, safeTxHash: computedHash };
        }

        const envelope = this.getEnvelope(transaction);

        try {
            const message = {
                to: envelope.to as Hex,
                value: BigInt(envelope.value),
                data: envelope.data as Hex,
                operation: envelope.operation,
                safeTxGas: BigInt(envelope.safeTxGas),
                baseGas: BigInt(envelope.baseGas),
                gasPrice: BigInt(envelope.gasPrice),
                gasToken: envelope.gasToken as Hex,
                refundReceiver: envelope.refundReceiver as Hex,
                nonce: BigInt(envelope.nonce),
            };

            return {
                verification,
                safeTxHash: computedHash,
                domainHash: hashDomain({
                    domain: {
                        chainId,
                        verifyingContract: safeAddress as Hex,
                    },
                    types: safeDomainTypes,
                }),
                messageHash: hashStruct({
                    data: message,
                    primaryType: 'SafeTx',
                    types: safeTxTypes,
                }),
            };
        } catch {
            return { verification, safeTxHash: computedHash };
        }
    };

    /**
     * Safe v1.3.0 added `chainId` to the EIP-712 domain. Anything below that hashes a different
     * domain, which this deliberately declines to reconstruct.
     */
    private hasChainIdInDomain = (safeVersion: string): boolean => {
        const [major = 0, minor = 0] = safeVersion
            .split('.')
            .map((part) => Number.parseInt(part, 10));

        return major > 1 || (major === 1 && minor >= 3);
    };

    /**
     * Unpacks the MultiSend batch a call carries, one level deep. Callers that walk nested batches
     * recurse themselves and stop at `maxSafeBatchDepth`.
     */
    inspectBatch = (data: string | null): ISafeBatchInspection => {
        if (this.getSelector(data) !== safeMultiSendSelector) {
            return { status: SafeBatchStatus.NOT_A_BATCH, calls: [] };
        }

        let packedCalls: Hex;

        try {
            const { args } = decodeFunctionData({
                abi: safeMultiSendAbi,
                data: data as Hex,
            });
            [packedCalls] = args;
        } catch {
            return { status: SafeBatchStatus.UNRECOGNIZED, calls: [] };
        }

        return this.unpackCalls(packedCalls);
    };

    private unpackCalls = (packedCalls: Hex): ISafeBatchInspection => {
        const packed = packedCalls.slice(2);
        const calls: ISafeCall[] = [];
        let cursor = 0;

        while (cursor < packed.length) {
            if (cursor + multiSendHeaderLength > packed.length) {
                return { status: SafeBatchStatus.TRUNCATED, calls };
            }

            const operation = Number.parseInt(
                packed.slice(cursor, cursor + 2),
                16,
            );
            const to = `0x${packed.slice(cursor + 2, cursor + 42)}`;
            const value = BigInt(
                `0x${packed.slice(cursor + 42, cursor + 106)}`,
            );
            const dataLength = Number(
                BigInt(`0x${packed.slice(cursor + 106, cursor + 170)}`),
            );

            // MultiSend's assembly switches on `case 0` / `case 1` with no default, so any other
            // operation byte leaves `success = 0` and reverts the whole batch - while still
            // consuming the nonce. The top-level guard restricts `operation` to 0|1, but these
            // bytes are packed inside the payload and unchecked, so a value outside that set is
            // treated as an unreadable batch rather than rendered as a benign "Call".
            if (operation !== 0 && operation !== 1) {
                return { status: SafeBatchStatus.TRUNCATED, calls };
            }

            const dataStart = cursor + multiSendHeaderLength;
            const dataEnd = dataStart + dataLength * 2;

            if (dataEnd > packed.length) {
                return { status: SafeBatchStatus.TRUNCATED, calls };
            }

            calls.push({
                to,
                operation,
                value,
                data: `0x${packed.slice(dataStart, dataEnd)}`,
            });
            cursor = dataEnd;
        }

        return { status: SafeBatchStatus.COMPLETE, calls };
    };

    private getSelector = (data: string | null): string | undefined =>
        data != null && data.length >= 10
            ? data.slice(0, 10).toLowerCase()
            : undefined;
}

export const safeTransactionEnvelopeUtils = new SafeTransactionEnvelopeUtils();
