import type { Address, Hex } from 'viem';
import type {
    IMpcPrepareTransactionResponse,
    IMpcServerSharePayload,
    IMpcSignRequest,
    MpcProviderId,
} from '@/modules/mpc/api/mpcService/domain';
import type { IMpcRecoveryShare } from '@/modules/mpc/utils/recoveryShare';

/**
 * Steps of the key generation ceremony, reported through onProgress.
 */
export type MpcCeremonyStep =
    | 'generating'
    | 'splitting'
    | 'storing_device_share'
    | 'registering_server_share'
    | 'done';

export interface IMpcRegisterServerShareParams {
    address: Address;
    publicKey: Hex;
    serverShare: IMpcServerSharePayload;
}

export interface IMpcCreateKeyParams {
    systemId: string;
    /**
     * Signing passphrase used to encrypt the device share (never leaves the browser).
     */
    passphrase: string;
    onProgress?: (step: MpcCeremonyStep) => void;
    /**
     * Optional callback used to register the server share on the co-signer during the ceremony (the provider
     * reports the "registering_server_share" step around it). When omitted the caller must register the returned
     * serverShare itself.
     */
    registerServerShare?: (
        params: IMpcRegisterServerShareParams,
    ) => Promise<void>;
}

export interface IMpcCreateKeyResult {
    address: Address;
    /**
     * Uncompressed public key.
     */
    publicKey: Hex;
    /**
     * Share B (index 2) to be registered on the co-signer.
     */
    serverShare: IMpcServerSharePayload;
    /**
     * Share C (index 3), shown once to the user and never stored.
     */
    recoveryShare: IMpcRecoveryShare;
    /**
     * Text serialization of the recovery share for download.
     */
    recoveryShareText: string;
    deviceShareStored: true;
}

export interface IMpcSignParams {
    systemId: string;
    passphrase: string;
    request: IMpcSignRequest;
    /**
     * Server share released by the co-signer for this request.
     */
    serverShare: IMpcServerSharePayload;
    /**
     * Prepared transaction (nonce / gas / fees) returned by the prepare endpoint, required for transaction requests.
     */
    preparedTransaction?: IMpcPrepareTransactionResponse;
}

export interface IMpcVerifyDeviceShareParams {
    systemId: string;
    passphrase: string;
}

export interface IMpcSignResult {
    /**
     * Signature (message / typed data) or the signed raw transaction (transactions).
     */
    signature: Hex;
    /**
     * Signed raw transaction (transaction requests only).
     */
    signedTransaction?: Hex;
}

/**
 * Callback used by reshare / recover to upload the new server share to the co-signer. The provider only persists
 * the new device share once the callback resolved, so a failed upload leaves the browser unchanged.
 */
export type MpcUploadServerShare = (
    serverShare: IMpcServerSharePayload,
) => Promise<void>;

export interface IMpcReshareParams {
    systemId: string;
    passphrase: string;
    /**
     * New signing passphrase, defaults to the current one.
     */
    newPassphrase?: string;
    serverShare: IMpcServerSharePayload;
    /**
     * Address of the system: the reconstructed key is verified against it before anything is stored / uploaded.
     */
    expectedAddress?: Address;
    /**
     * Uploads the new server share; the new device share is stored only after it resolves. When omitted the
     * caller must upload the returned serverShare itself (device share stored immediately).
     */
    uploadServerShare?: MpcUploadServerShare;
}

export interface IMpcReshareResult {
    /**
     * New server share (epoch + 1).
     */
    serverShare: IMpcServerSharePayload;
    recoveryShare: IMpcRecoveryShare;
    recoveryShareText: string;
}

export interface IMpcRecoverParams {
    systemId: string;
    recoveryShare: IMpcRecoveryShare;
    serverShare: IMpcServerSharePayload;
    newPassphrase: string;
    /**
     * Address of the system: the reconstructed key is verified against it before anything is stored / uploaded.
     */
    expectedAddress?: Address;
    /**
     * Uploads the new server share; the new device share is stored only after it resolves.
     */
    uploadServerShare?: MpcUploadServerShare;
}

export interface IMpcExportKeyParams {
    systemId: string;
    passphrase: string;
    /**
     * Either the recovery share or a server share is required as second share (the UI only uses the recovery
     * share: the co-signer never releases its share for export).
     */
    recoveryShare?: IMpcRecoveryShare;
    serverShare?: IMpcServerSharePayload;
    /**
     * Address of the system: the reconstructed key is verified against it before being returned.
     */
    expectedAddress?: Address;
}

/**
 * Client-side abstraction of the MPC key provider. The POC ships a mock Shamir 2-of-3 implementation; a real
 * TSS provider (Dfns, Dynamic, ...) would implement the same interface without ever reconstructing the key.
 */
export interface IMpcProviderAdapter {
    id: MpcProviderId;
    label: string;
    isMock: boolean;
    createKey: (params: IMpcCreateKeyParams) => Promise<IMpcCreateKeyResult>;
    /**
     * Verifies that the device share is present in this browser and can be unlocked with the passphrase (throws
     * otherwise). Called before asking the co-signer to release its share so a typo never burns a release.
     */
    verifyDeviceShare: (params: IMpcVerifyDeviceShareParams) => Promise<void>;
    sign: (params: IMpcSignParams) => Promise<IMpcSignResult>;
    reshare: (params: IMpcReshareParams) => Promise<IMpcReshareResult>;
    recover: (params: IMpcRecoverParams) => Promise<IMpcReshareResult>;
    exportKey: (params: IMpcExportKeyParams) => Promise<Hex>;
    hasDeviceShare: (systemId: string) => Promise<boolean>;
}
