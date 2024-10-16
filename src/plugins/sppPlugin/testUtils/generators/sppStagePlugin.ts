import { generatePlugin } from '@/shared/testUtils';
import { type ISppStagePlugin, SppProposalType } from '../../types';
import { generateSppPluginSettings } from './sppSettings';

export const generateSppStagePlugin = (plugin?: Partial<ISppStagePlugin>): ISppStagePlugin => ({
    ...generatePlugin(),
    proposalType: SppProposalType.APPROVAL,
    address: '0xtest',
    subdomain: 'test',
    release: '0',
    build: '0',
    isProcess: false,
    isBody: false,
    isSubPlugin: false,
    settings: generateSppPluginSettings(),
    blockTimestamp: 0,
    ...plugin,
});
