import { generateDaoPlugin } from '@/shared/testUtils';
import { type ISppStagePlugin, SppProposalType } from '../../types';

export const generateSppStagePlugin = (plugin?: Partial<ISppStagePlugin>): ISppStagePlugin => ({
    ...generateDaoPlugin(),
    proposalType: SppProposalType.APPROVAL,
    ...plugin,
});
