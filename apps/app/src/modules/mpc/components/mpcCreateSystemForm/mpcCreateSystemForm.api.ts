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
     * Whether the user confirmed having stored the recovery share.
     */
    recoveryAcknowledged: boolean;
    /**
     * Initial policy.
     */
    policy: IMpcPolicyFormData;
}
