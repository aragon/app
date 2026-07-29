import { generateProposal } from '@/modules/governance/testUtils';
import { generateLockToVotePluginSettings } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVotePluginSettings';
import { generateLockToVotePluginSettingsToken } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVotePluginSettingsToken';
import { generateLockToVoteProposal } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVoteProposal';
import { generateLockToVoteStagePlugin } from '@/plugins/lockToVotePlugin/testUtils/generators/lockToVoteStagePlugin';
import {
    generateSppPluginSettings,
    generateSppProposal,
    generateSppStage,
    generateSppStagePlugin,
} from '@/plugins/sppPlugin/testUtils';
import { PluginInterfaceType } from '@/shared/api/daoService';
import { collectTokenAddresses } from './collectTokenAddresses';

describe('collectTokenAddresses', () => {
    it('returns the lock-to-vote token address for a standalone lock-to-vote proposal', () => {
        const proposal = generateLockToVoteProposal({
            pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            settings: generateLockToVotePluginSettings({
                token: generateLockToVotePluginSettingsToken({
                    address: '0xAaaA',
                }),
            }),
        });

        expect(collectTokenAddresses(proposal)).toEqual(['0xaaaa']);
    });

    it('returns an empty array for a non-lock-to-vote proposal', () => {
        const proposal = generateProposal({
            pluginInterfaceType: PluginInterfaceType.MULTISIG,
        });

        expect(collectTokenAddresses(proposal)).toEqual([]);
    });

    it('collects multiple unique addresses across SPP stages with mixed body types', () => {
        const proposal = generateSppProposal({
            pluginInterfaceType: PluginInterfaceType.SPP,
            settings: generateSppPluginSettings({
                stages: [
                    generateSppStage({
                        plugins: [
                            generateLockToVoteStagePlugin({
                                settings: generateLockToVotePluginSettings({
                                    token: generateLockToVotePluginSettingsToken(
                                        { address: '0xAa' },
                                    ),
                                }),
                            }),
                            generateSppStagePlugin({
                                interfaceType: PluginInterfaceType.MULTISIG,
                            }),
                        ],
                    }),
                    generateSppStage({
                        plugins: [
                            generateLockToVoteStagePlugin({
                                settings: generateLockToVotePluginSettings({
                                    token: generateLockToVotePluginSettingsToken(
                                        { address: '0xBB' },
                                    ),
                                }),
                            }),
                            generateLockToVoteStagePlugin({
                                settings: generateLockToVotePluginSettings({
                                    token: generateLockToVotePluginSettingsToken(
                                        { address: '0xaa' },
                                    ),
                                }),
                            }),
                        ],
                    }),
                ],
            }),
        });

        expect(collectTokenAddresses(proposal).sort()).toEqual(
            ['0xaa', '0xbb'].sort(),
        );
    });

    it('ignores stages with no lock-to-vote plugins', () => {
        const proposal = generateSppProposal({
            pluginInterfaceType: PluginInterfaceType.SPP,
            settings: generateSppPluginSettings({
                stages: [
                    generateSppStage({
                        plugins: [
                            generateSppStagePlugin({
                                interfaceType: PluginInterfaceType.MULTISIG,
                            }),
                        ],
                    }),
                ],
            }),
        });

        expect(collectTokenAddresses(proposal)).toEqual([]);
    });

    it('handles missing token address on a lock-to-vote plugin gracefully', () => {
        const proposal = generateLockToVoteProposal({
            pluginInterfaceType: PluginInterfaceType.LOCK_TO_VOTE,
            settings: generateLockToVotePluginSettings({
                token: generateLockToVotePluginSettingsToken({ address: '' }),
            }),
        });

        expect(collectTokenAddresses(proposal)).toEqual([]);
    });
});
