import type { IMpcPolicyFormData } from '../mpcPolicyForm';

export interface IMpcCreateSystemFormData {
    /**
     * Name of the system.
     */
    name: string;
    /**
     * Optional description.
     */
    description: string;
    /**
     * Comma separated chain ids declared by the system (only Sepolia operates in the POC).
     */
    chainIds: string;
    /**
     * Signing passphrase (never leaves the browser, encrypts the device share).
     */
    passphrase: string;
    /**
     * Passphrase confirmation.
     */
    confirmPassphrase: string;
    /**
     * Whether the user confirmed having stored the recovery share.
     */
    recoveryAcknowledged: boolean;
    /**
     * Initial policy.
     */
    policy: IMpcPolicyFormData;
}
