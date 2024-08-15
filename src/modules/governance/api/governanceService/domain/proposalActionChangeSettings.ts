import { type IDaoSettings } from '@/shared/api/daoService';
import { type IProposalActionChangeSettings as OdsIProposalActionChangeSettings } from '@aragon/ods';
import { type ProposalActionType } from './enum';

export interface IProposalActionChangeSettings<TSettings extends IDaoSettings['settings'] = IDaoSettings['settings']>
    extends Omit<OdsIProposalActionChangeSettings, 'type' | 'proposedSettings' | 'existingSettings'> {
    /**
     * The type of the proposal action.
     */
    type: ProposalActionType.UPDATE_MULTISIG_SETTINGS | ProposalActionType.UPDATE_VOTE_SETTINGS;
    /**
     * The proposed settings to be updated.
     */
    proposedSettings: TSettings;
}
