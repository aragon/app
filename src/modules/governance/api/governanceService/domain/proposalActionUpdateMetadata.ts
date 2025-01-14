import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IResource } from '@/shared/api/daoService';
import type {
    IProposalActionUpdateMetadata as IGukProposalActionUpdateMetadata,
    IInputFileAvatarValue,
} from '@aragon/gov-ui-kit';

export interface IProposalActionUpdateMetadataObject {
    /**
     * The logo of the DAO.
     */
    avatar?: string | IInputFileAvatarValue;
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

export interface IProposalActionUpdateMetadata
    extends Omit<IGukProposalActionUpdateMetadata, 'type' | 'proposedMetadata' | 'existingMetadata'> {
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
