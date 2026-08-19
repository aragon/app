import type { Address, Hex } from 'viem';
import type { IMpcPolicy } from './mpcPolicy';

export type MpcProviderId = 'mock-shamir' | 'dfns' | 'dynamic';

export type MpcSystemStatus = 'initializing' | 'active' | 'deleted';

export type MpcMemberRole = 'owner' | 'approver' | 'viewer';

export interface IMpcMember {
    /**
     * User id of the member.
     */
    userId: string;
    /**
     * Username of the member.
     */
    username: string;
    /**
     * Role of the member in the system.
     */
    role: MpcMemberRole;
    /**
     * Timestamp the member was added (ISO 8601).
     */
    addedAt: string;
}

export interface IMpcSystem {
    /**
     * Unique identifier of the system.
     */
    id: string;
    /**
     * Human readable name.
     */
    name: string;
    /**
     * Optional description.
     */
    description?: string;
    /**
     * Status of the system.
     */
    status: MpcSystemStatus;
    /**
     * Provider used to generate and use the key.
     */
    providerId: MpcProviderId;
    /**
     * Address derived from the MPC public key (undefined while initializing).
     */
    address?: Address;
    /**
     * Uncompressed public key (undefined while initializing).
     */
    publicKey?: Hex;
    /**
     * Chain IDs the system declares (only Sepolia is operational in the POC).
     */
    chainIds: number[];
    /**
     * Current key epoch (incremented on every reshare).
     */
    epoch: number;
    /**
     * Whether the creator acknowledged having stored the recovery share.
     */
    recoveryAcknowledged: boolean;
    /**
     * Signing policy of the system.
     */
    policy: IMpcPolicy;
    /**
     * Members and their roles.
     */
    members: IMpcMember[];
    /**
     * User id of the creator.
     */
    createdBy: string;
    /**
     * Creation timestamp (ISO 8601).
     */
    createdAt: string;
    /**
     * Last update timestamp (ISO 8601).
     */
    updatedAt: string;
}

/**
 * Server share payload as exchanged between the client and the co-signer (mock POC).
 * The value is the Shamir share encoded as 0x-prefixed 32-byte hex.
 */
export interface IMpcServerSharePayload {
    /**
     * Shamir share index (1..3).
     */
    index: number;
    /**
     * Share value (0x-prefixed hex, 32 bytes).
     */
    value: Hex;
    /**
     * Epoch this share belongs to.
     */
    epoch: number;
}
