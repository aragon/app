import type { IMember } from '@/modules/governance/api/governanceService';
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

interface GrantOrRevokeTransaction {
    /**
     * Address to which the transaction is sent.
     */
    to: Hex;
    /**
     * Value of the transaction.
     */
    value: string;
    /**
     * Encoded transaction data to be decoded.
     */
    data: string;
}

interface IProposalValues {
    /**
     * Title of the proposal.
     */
    title: string;
    /**
     * Short description of the proposal.
     */
    summary: string;
}

export interface IBuildTransactionParams {
    /**
     *   Proposal values (title and description).
     */
    values: IProposalValues;
    /**
     * Array of grant or revoke actions to be executed by the proposal.
     */
    actions: GrantOrRevokeTransaction[];
    /**
     * CID of the proposal metadata pinned on IPFS.
     */
    metadataCid: string;
    /**
     * Admin plugin address.
     */
    pluginAddress: Hex;
}
