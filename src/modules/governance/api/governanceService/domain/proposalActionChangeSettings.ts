import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { type IDaoTokenSettings } from '@/plugins/tokenPlugin/types';
import { type IProposalActionChangeSettings as OdsIProposalActionChangeSettings } from '@aragon/ods';

export interface IProposalActionChangeSettings
    extends Omit<OdsIProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS;
    proposedSettings: IDaoMultisigSettings;
    existingSettings?: IDaoMultisigSettings;
}

export interface IProposalActionChangeTokenSettings
    extends Omit<OdsIProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    type: ProposalActionType.UPDATE_VOTE_SETTINGS;
    proposedSettings: IDaoTokenSettings;
    existingSettings?: IDaoTokenSettings;
}

export type ExtendedProposalActionChangeSettings = IProposalActionChangeSettings | IProposalActionChangeTokenSettings;
