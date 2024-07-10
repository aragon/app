import type { IDaoSettings } from '@/shared/api/daoService';

export interface IDaoMultisigSettings extends IDaoSettings {
    settings: {
        /**
         * The minimum number of approvals required for a proposal to be approved.
         */
        minApprovals: number;
    };
}
