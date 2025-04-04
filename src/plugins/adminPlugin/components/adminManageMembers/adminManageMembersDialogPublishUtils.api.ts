import type { IMember } from '@/modules/governance/api/governanceService';
import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { ICompositeAddress } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';

export interface IBuildActionsArrayParams {
    /**
     * The current admins of the DAO.
     */
    currentAdmins: IMember[];
    /**
     * The proposed updated admins of the DAO.
     */
    updatedAdmins: ICompositeAddress[];
    /**
     * The address of the admin plugin.
     */
    pluginAddress: Hex;
    /**
     * The address of the DAO.
     */
    daoAddress: Hex;
}

export interface IBuildTransactionParams {
    /**
     * Array of grant or revoke actions to be executed by the proposal.
     */
    actions: ITransactionRequest[];
    /**
     * CID of the proposal metadata pinned on IPFS.
     */
    metadataCid: string;
    /**
     * Admin plugin address.
     */
    pluginAddress: Hex;
}
