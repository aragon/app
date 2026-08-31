import type {
    Address,
    Hex,
    TransactionSerializableEIP1559,
    TypedDataDefinition,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type {
    IMpcPrepareTransactionResponse,
    IMpcServerSharePayload,
    IMpcSignRequest,
} from '@/modules/mpc/api/mpcService/domain';
import { getDeviceKey } from '@/modules/mpc/utils/deviceKey';
import {
    hasDeviceShare as hasStoredDeviceShare,
    loadDeviceShare,
    saveDeviceShare,
} from '@/modules/mpc/utils/deviceShareStorage';
import {
    decryptWithSecret,
    encryptWithSecret,
} from '@/modules/mpc/utils/mpcCrypto';
import {
    type IMpcRecoveryShare,
    serializeRecoveryShare,
} from '@/modules/mpc/utils/recoveryShare';
import {
    combineShares,
    hexToShare,
    type IShamirShare,
    shareToHex,
    splitSecret,
} from '@/modules/mpc/utils/shamir';
import type {
    IMpcCreateKeyParams,
    IMpcCreateKeyResult,
    IMpcExportKeyParams,
    IMpcProviderAdapter,
    IMpcRecoverParams,
    IMpcReshareParams,
    IMpcReshareResult,
    IMpcSignParams,
    IMpcSignResult,
    IMpcVerifyDeviceShareParams,
    MpcUploadServerShare,
} from './mpcProvider.api';

/**
 * POC / mock provider: Shamir 2-of-3 over the secp256k1 order.
 *
 * Trust model (see modules/mpc/README.md):
 * - share A (index 1): device, AES-GCM encrypted with the per-browser device key, stored in IndexedDB;
 * - share B (index 2): co-signer (Aragon server), released only for authorized flows;
 * - share C (index 3): recovery, shown once and never stored.
 * The private key is reconstructed in the browser only for the duration of a signature. A real TSS provider
 * would replace this adapter without changing the UI.
 */

const DEVICE_SHARE_INDEX = 1;
const SERVER_SHARE_INDEX = 2;
const RECOVERY_SHARE_INDEX = 3;

interface ISplitResult {
    deviceShare: IShamirShare;
    serverShare: IMpcServerSharePayload;
    recoveryShare: IMpcRecoveryShare;
    recoveryShareText: string;
}

const splitPrivateKey = (
    privateKey: Hex,
    systemId: string,
    epoch: number,
): ISplitResult => {
    const [deviceShare, server, recovery] = splitSecret(
        BigInt(privateKey),
        2,
        3,
    );
    const serverShare: IMpcServerSharePayload = {
        index: SERVER_SHARE_INDEX,
        value: shareToHex(server),
        epoch,
    };
    const recoveryShare: IMpcRecoveryShare = {
        systemId,
        index: RECOVERY_SHARE_INDEX,
        value: shareToHex(recovery),
        epoch,
    };

    return {
        deviceShare,
        serverShare,
        recoveryShare,
        recoveryShareText: serializeRecoveryShare(recoveryShare),
    };
};

const storeDeviceShare = async (
    systemId: string,
    deviceShare: IShamirShare,
    epoch: number,
): Promise<void> => {
    const encrypted = await encryptWithSecret(
        shareToHex(deviceShare),
        getDeviceKey(),
    );
    await saveDeviceShare({
        systemId,
        epoch,
        ...encrypted,
        createdAt: new Date().toISOString(),
    });
};

const loadDecryptedDeviceShare = async (
    systemId: string,
): Promise<{ share: IShamirShare; epoch: number }> => {
    const record = await loadDeviceShare(systemId);

    if (record == null) {
        throw new Error('mockShamirProvider: no device share on this browser');
    }

    const value = await decryptWithSecret(record, getDeviceKey());

    return {
        share: hexToShare(DEVICE_SHARE_INDEX, value),
        epoch: record.epoch,
    };
};

const reconstructPrivateKey = (
    shares: IShamirShare[],
    expectedAddress?: Address,
): Hex => {
    const secret = combineShares(shares);
    const privateKey: Hex = `0x${secret.toString(16).padStart(64, '0')}`;

    // A wrong / corrupted share yields a garbage key: never use it to overwrite shares or show it as the key.
    if (
        expectedAddress != null &&
        privateKeyToAccount(privateKey).address.toLowerCase() !==
            expectedAddress.toLowerCase()
    ) {
        throw new Error(
            'mockShamirProvider: reconstructed key does not match the system address (wrong or corrupted share)',
        );
    }

    return privateKey;
};

/**
 * Builds the unsigned EIP-1559 transaction from the server-prepared fields (also used to preview the hash).
 */
export const buildMpcTransaction = (
    prepared: IMpcPrepareTransactionResponse,
): TransactionSerializableEIP1559 => ({
    type: 'eip1559',
    chainId: prepared.chainId,
    nonce: prepared.nonce,
    to: prepared.to,
    value: BigInt(prepared.valueWei),
    data: prepared.data,
    gas: BigInt(prepared.gas),
    maxFeePerGas: BigInt(prepared.maxFeePerGasWei),
    maxPriorityFeePerGas: BigInt(prepared.maxPriorityFeePerGasWei),
});

const signWithPrivateKey = async (
    privateKey: Hex,
    request: IMpcSignRequest,
    preparedTransaction?: IMpcPrepareTransactionResponse,
): Promise<IMpcSignResult> => {
    const account = privateKeyToAccount(privateKey);
    const { payload } = request;

    if (payload.type === 'message') {
        const signature = await account.signMessage({
            message: payload.message.message,
        });

        return { signature };
    }

    if (payload.type === 'typedData') {
        // POC: typed data JSON is trusted as-is (numeric fields must already be JSON-compatible).
        const typedData = JSON.parse(
            payload.typedData.typedDataJson,
        ) as TypedDataDefinition;
        const signature = await account.signTypedData(typedData);

        return { signature };
    }

    if (preparedTransaction == null) {
        throw new Error(
            'mockShamirProvider: preparedTransaction is required for transaction requests',
        );
    }

    if (
        preparedTransaction.to.toLowerCase() !==
            payload.transaction.to.toLowerCase() ||
        preparedTransaction.chainId !== payload.transaction.chainId ||
        preparedTransaction.valueWei !== payload.transaction.valueWei
    ) {
        throw new Error(
            'mockShamirProvider: prepared transaction does not match the request',
        );
    }

    const signedTransaction = await account.signTransaction(
        buildMpcTransaction(preparedTransaction),
    );

    return { signature: signedTransaction, signedTransaction };
};

const validateEpochs = (...shares: Array<{ epoch: number }>) => {
    const epochs = new Set(shares.map((share) => share.epoch));

    if (epochs.size > 1) {
        throw new Error(
            'mockShamirProvider: shares belong to different epochs',
        );
    }
};

const createKey = async (
    params: IMpcCreateKeyParams,
): Promise<IMpcCreateKeyResult> => {
    const { systemId, onProgress, registerServerShare } = params;
    const epoch = 1;

    onProgress?.('generating');
    // POC: the key is generated in the browser; the private key only lives in this function scope.
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    const address: Address = account.address;
    const publicKey: Hex = account.publicKey;

    onProgress?.('splitting');
    const split = splitPrivateKey(privateKey, systemId, epoch);

    onProgress?.('storing_device_share');
    await storeDeviceShare(systemId, split.deviceShare, epoch);

    if (registerServerShare != null) {
        onProgress?.('registering_server_share');
        await registerServerShare({
            address,
            publicKey,
            serverShare: split.serverShare,
        });
    }

    onProgress?.('done');

    return {
        address,
        publicKey,
        serverShare: split.serverShare,
        recoveryShare: split.recoveryShare,
        recoveryShareText: split.recoveryShareText,
        deviceShareStored: true,
    };
};

const verifyDeviceShare = async (
    params: IMpcVerifyDeviceShareParams,
): Promise<void> => {
    // Decrypts and discards the share: throws when missing or not decryptable with the device key.
    await loadDecryptedDeviceShare(params.systemId);
};

const sign = async (params: IMpcSignParams): Promise<IMpcSignResult> => {
    const { systemId, request, serverShare, preparedTransaction } = params;
    const device = await loadDecryptedDeviceShare(systemId);
    validateEpochs(device, serverShare);

    const privateKey = reconstructPrivateKey([
        device.share,
        hexToShare(serverShare.index, serverShare.value),
    ]);

    return signWithPrivateKey(privateKey, request, preparedTransaction);
};

const resplit = async (
    systemId: string,
    privateKey: Hex,
    epoch: number,
    uploadServerShare?: MpcUploadServerShare,
): Promise<IMpcReshareResult> => {
    const split = splitPrivateKey(privateKey, systemId, epoch);

    // The co-signer must accept the new share B first: if the upload fails the device keeps its current share
    // (same epoch as the server) instead of ending up one epoch ahead.
    await uploadServerShare?.(split.serverShare);
    await storeDeviceShare(systemId, split.deviceShare, epoch);

    return {
        serverShare: split.serverShare,
        recoveryShare: split.recoveryShare,
        recoveryShareText: split.recoveryShareText,
    };
};

const reshare = async (
    params: IMpcReshareParams,
): Promise<IMpcReshareResult> => {
    const { systemId, serverShare, expectedAddress, uploadServerShare } =
        params;
    const device = await loadDecryptedDeviceShare(systemId);
    validateEpochs(device, serverShare);

    const privateKey = reconstructPrivateKey(
        [device.share, hexToShare(serverShare.index, serverShare.value)],
        expectedAddress,
    );

    return resplit(
        systemId,
        privateKey,
        serverShare.epoch + 1,
        uploadServerShare,
    );
};

const recover = async (
    params: IMpcRecoverParams,
): Promise<IMpcReshareResult> => {
    const {
        systemId,
        recoveryShare,
        serverShare,
        expectedAddress,
        uploadServerShare,
    } = params;
    validateEpochs(recoveryShare, serverShare);

    const privateKey = reconstructPrivateKey(
        [
            hexToShare(recoveryShare.index, recoveryShare.value),
            hexToShare(serverShare.index, serverShare.value),
        ],
        expectedAddress,
    );

    // Any stale device share is overwritten once the co-signer accepted the new share (see resplit).
    return await resplit(
        systemId,
        privateKey,
        serverShare.epoch + 1,
        uploadServerShare,
    );
};

const exportKey = async (params: IMpcExportKeyParams): Promise<Hex> => {
    const { systemId, recoveryShare, serverShare, expectedAddress } = params;
    const secondShare = recoveryShare ?? serverShare;

    if (secondShare == null) {
        throw new Error(
            'mockShamirProvider: recovery or server share is required to export the key',
        );
    }

    const device = await loadDecryptedDeviceShare(systemId);
    validateEpochs(device, secondShare);

    return reconstructPrivateKey(
        [device.share, hexToShare(secondShare.index, secondShare.value)],
        expectedAddress,
    );
};

export const mockShamirProvider: IMpcProviderAdapter = {
    id: 'mock-shamir',
    label: 'Mock Shamir 2-of-3 (POC)',
    isMock: true,
    createKey,
    verifyDeviceShare,
    sign,
    reshare,
    recover,
    exportKey,
    hasDeviceShare: (systemId: string) => hasStoredDeviceShare(systemId),
};
