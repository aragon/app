import { type IProposalActionChangeSettings as IGukProposalActionChangeSettings } from '@aragon/gov-ui-kit';
import type { MultisigProposalActionType } from './enum';
import type { IMultisigPluginSettings } from './multisigPluginSettings';

export interface IMultisigActionChangeSettings
    extends Omit<IGukProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: MultisigProposalActionType.UPDATE_MULTISIG_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: IMultisigPluginSettings;
}
