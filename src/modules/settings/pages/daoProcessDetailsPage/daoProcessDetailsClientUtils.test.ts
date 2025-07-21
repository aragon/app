import { GovernanceType } from '@/modules/createDao/components/createProcessForm';
import { SetupBodyType } from '@/modules/createDao/dialogs/setupBodyDialog';
import { generateSppPluginSettings, generateSppStage, generateSppStagePlugin } from '@/plugins/sppPlugin/testUtils';
import { generateTokenPluginSettings } from '@/plugins/tokenPlugin/testUtils';
import { generateTokenPluginSettingsToken } from '@/plugins/tokenPlugin/testUtils/generators/tokenPluginSettingsToken';
import { generateDaoPlugin, generatePluginSettings } from '@/shared/testUtils';
import { daoProcessDetailsClientUtils } from './daoProcessDetailsClientUtils';

describe('processDetailsClientUtils', () => {
    describe('pluginToProcessFormData', () => {
        describe('BASIC governance', () => {
            it('creates form data for a token plugin', () => {
                const plugin = generateDaoPlugin({
                    name: 'TokenPlugin',
                    isBody: true,
                    isProcess: true,
                    settings: generateTokenPluginSettings({
                        token: generateTokenPluginSettingsToken({ address: '0xToken' }),
                    }),
                });

                const result = daoProcessDetailsClientUtils.pluginToProcessFormData(plugin, []);

                expect(result.governanceType).toBe(GovernanceType.BASIC);
                expect('body' in result).toBe(true);
                if ('body' in result) {
                    expect(result.body.type).toBe(SetupBodyType.EXISTING);
                    expect(result.body.name).toBe('TokenPlugin');
                    if ('governance' in result.body) {
                        expect(result.body.governance).toEqual(plugin.settings);
                    }
                }
            });

            it('creates form data for a multisig plugin', () => {
                const plugin = generateDaoPlugin({
                    name: 'Multisig',
                    isBody: true,
                    isProcess: true,
                    settings: generatePluginSettings(), // no token
                });

                const result = daoProcessDetailsClientUtils.pluginToProcessFormData(plugin, []);

                expect(result.governanceType).toBe(GovernanceType.BASIC);
                expect('body' in result).toBe(true);
                if ('body' in result) {
                    expect(result.body.type).toBe(SetupBodyType.EXISTING);
                    expect(result.body.name).toBe('Multisig');
                }
            });

            it('uses fallback name if plugin name is an empty string', () => {
                const plugin = generateDaoPlugin({
                    name: '',
                    subdomain: 'token-voting',
                    isBody: true,
                    isProcess: true,
                });

                const result = daoProcessDetailsClientUtils.pluginToProcessFormData(plugin, []);
                if ('body' in result) {
                    expect(result.body.name).toBe('Token Voting');
                }
            });
        });

        describe('ADVANCED governance', () => {
            it('creates form data with stage from plugin settings', () => {
                const settings = generateSppPluginSettings({
                    stages: [generateSppStage({ voteDuration: 3600 })],
                });

                const plugin = generateDaoPlugin({
                    isProcess: true,
                    isBody: false,
                    settings,
                });

                const result = daoProcessDetailsClientUtils.pluginToProcessFormData(plugin, []);
                expect(result.governanceType).toBe(GovernanceType.ADVANCED);
                expect('stages' in result).toBe(true);

                if ('stages' in result) {
                    expect(result.stages).toHaveLength(1);
                    expect(result.stages[0].settings.votingPeriod.days).toBe(0);
                    expect(result.stages[0].settings.votingPeriod.hours).toBe(1);
                    expect(result.stages[0].settings.votingPeriod.minutes).toBe(0);
                }
            });

            it('hydrates sub-plugin using allPlugins array', () => {
                const hydratedPlugin = generateDaoPlugin({
                    address: '0xSub',
                    name: 'Hydrated',
                    subdomain: 'token-voting',
                    settings: generateTokenPluginSettings({
                        token: generateTokenPluginSettingsToken({ address: '0xHydratedToken' }),
                    }),
                });

                const settings = generateSppPluginSettings({
                    stages: [
                        generateSppStage({
                            plugins: [
                                generateSppStagePlugin({
                                    address: '0xSub',
                                    settings: undefined,
                                    subdomain: undefined,
                                }),
                            ],
                        }),
                    ],
                });

                const mainPlugin = generateDaoPlugin({
                    isProcess: true,
                    isBody: false,
                    settings,
                });

                const result = daoProcessDetailsClientUtils.pluginToProcessFormData(mainPlugin, [hydratedPlugin]);

                if ('stages' in result) {
                    const body = result.stages[0].bodies[0];
                    expect(body.name).toBe('Hydrated');
                    if ('subdomain' in body) {
                        expect(body.subdomain).toBe('token-voting');
                    }
                    if ('governance' in body && typeof body.governance === 'object' && body.governance !== null) {
                        expect('token' in body.governance).toBe(true);
                    }
                }
            });
        });
    });
});
