import type { IDaoSettings } from '@/shared/api/daoService';

export interface IDaoMultisigSettings extends IDaoSettings {
    settings: {
        /**
         * The minimum number of approvals required for a proposal to be approved.
         */
        minApprovals: number;
        /**
         * Boolean indicating whether only multisig members can vote on proposals.
         */
        onlyListed: boolean;
    };
}
