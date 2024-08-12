import { type ProposalActionType } from '@/modules/governance/api/governanceService/domain/enum';
import { type IDaoMultisigSettings } from '@/plugins/multisigPlugin/types';
import { type IDaoTokenSettings } from '@/plugins/tokenPlugin/types';
import { type IProposalActionChangeSettings as OdsIProposalActionChangeSettings } from '@aragon/ods';

export interface IProposalActionChangeSettings
    extends Omit<OdsIProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: IDaoMultisigSettings;
}

export interface IProposalActionChangeTokenSettings
    extends Omit<OdsIProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.UPDATE_VOTE_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: IDaoTokenSettings;
}

export type ExtendedProposalActionChangeSettings = IProposalActionChangeSettings | IProposalActionChangeTokenSettings;
