import type { IDaoSettings } from '@/shared/api/daoService';

interface IDaoMultisigSettingsObject {
    /**
     * The minimum number of approvals required for a proposal to be approved.
     */
    minApprovals: number;
    /**
     * Boolean indicating whether only multisig members can vote on proposals.
     */
    onlyListed: boolean;
}

export interface IDaoMultisigSettings extends IDaoSettings<IDaoMultisigSettingsObject> {}
