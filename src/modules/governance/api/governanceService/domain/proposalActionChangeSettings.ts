import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IProposalActionChangeSettings as OdsIProposalActionChangeSettings } from '@aragon/ods';

export interface IProposalActionChangeSettings extends Omit<OdsIProposalActionChangeSettings, 'type'> {
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS | ProposalActionType.UPDATE_VOTE_SETTINGS;
}
