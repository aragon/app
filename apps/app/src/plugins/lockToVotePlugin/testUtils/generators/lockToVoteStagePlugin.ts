import {
    type ISppStagePluginInternal,
    SppProposalType,
} from '@/plugins/sppPlugin/types';
import { type IDaoPlugin, PluginInterfaceType } from '@/shared/api/daoService';
import { generateDaoPlugin } from '@/shared/testUtils';
import type { ILockToVotePluginSettings } from '../../types';
import { generateLockToVotePluginSettings } from './lockToVotePluginSettings';

/**
 * Test generator for an SPP-stage plugin body whose interface type is lock-to-vote. The return
 * type matches `lockToVoteProposalUtils.isLockToVoteStagePlugin`'s narrowed target, so fixtures
 * built with this generator typecheck against the predicate without manual casts.
 */
export const generateLockToVoteStagePlugin = (
    plugin?: Partial<
        ISppStagePluginInternal & IDaoPlugin<ILockToVotePluginSettings>
    >,
): ISppStagePluginInternal & IDaoPlugin<ILockToVotePluginSettings> => ({
    ...generateDaoPlugin<ILockToVotePluginSettings>({
        interfaceType: PluginInterfaceType.LOCK_TO_VOTE,
        settings: generateLockToVotePluginSettings(),
    }),
    proposalType: SppProposalType.APPROVAL,
    ...plugin,
});
