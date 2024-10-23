import { type IPluginSettings } from '@/shared/api/daoService';
import { type IProposalActionChangeSettings as IGukProposalActionChangeSettings } from '@aragon/gov-ui-kit';
import { type ProposalActionType } from './enum';

export interface IProposalActionChangeSettings<TSettings extends IPluginSettings = IPluginSettings>
    extends Omit<IGukProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS | ProposalActionType.UPDATE_VOTE_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: TSettings;
}
