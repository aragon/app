import type { ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import type { IResource } from '@/shared/api/daoService';
import type { IProposalAction } from './proposalAction';

export interface IProposalActionUpdateMetadataObject {
    /**
     * The logo of the DAO.
     */
    avatar?: string;
    /**
     * The name of the DAO.
     */
    name: string;
    /**
     * The description of the DAO.
     */
    description: string;
    /**
     * The links of the DAO
     */
    links: IResource[];
}

export interface IProposalActionUpdateMetadata extends IProposalAction {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.METADATA_UPDATE;
    /**
     * The proposed metadata to be updated.
     */
    proposedMetadata: IProposalActionUpdateMetadataObject;
    /**
     * The existing metadata.
     */
    existingMetadata: IProposalActionUpdateMetadataObject;
}
