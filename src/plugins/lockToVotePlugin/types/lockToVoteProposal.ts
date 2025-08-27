import type { ITokenProposal } from '@/plugins/tokenPlugin/types';
import type { ILockToVotePluginSettings } from './lockToVotePluginSettings';

export interface ILockToVoteProposal extends Omit<ITokenProposal, 'settings'> {
    settings: ILockToVotePluginSettings;
}
