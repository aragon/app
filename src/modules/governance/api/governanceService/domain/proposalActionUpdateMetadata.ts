import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IDaoLink } from '@/shared/api/daoService';
import { type IProposalActionUpdateMetadata as OdsIProposalActionUpdateMetadata } from '@aragon/ods';

export interface IMetadata {
    logo: string;
    name: string;
    description: string;
    links: IDaoLink[];
}

export interface IProposalActionUpdateMetadata
    extends Omit<OdsIProposalActionUpdateMetadata, 'type' | 'proposedMetadata' | 'existingMetadata'> {
    type: ProposalActionType.METADATA_UPDATE;
    proposedMetadata: IMetadata;
    existingMetadata: IMetadata;
}
