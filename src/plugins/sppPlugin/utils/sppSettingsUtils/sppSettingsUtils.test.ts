import { generateSppStage } from '@/plugins/sppPlugin/testUtils';
import { sppSettingsUtils } from './sppSettingsUtils';

describe('sppSettings utils', () => {
    describe('parseSettings', () => {
        it('returns the correct number of stages', () => {
            const settings = {
                pluginAddress: '0x12345678',
                pluginName: 'My Plugin A',
                stages: [generateSppStage(), generateSppStage(), generateSppStage()],
            };
            const result = sppSettingsUtils.parseSettings({
                settings,
                t: (key) => key,
            });

            expect(result).toEqual([
                {
                    term: 'app.plugins.spp.sppGovernanceSettings.numberOfStages',
                    definition: '3',
                },
            ]);
        });
    });

    describe('getFallbackSettings', () => {
        it('returns both pluginName and pluginAddress terms when both are defined', () => {
            const pluginAddress = '0x87654321';
            const pluginName = 'My Plugin A';
            const result = sppSettingsUtils.getFallbackSettings({
                settings: { pluginAddress, pluginName },
                t: (key) => key,
            });

            expect(result).toEqual([
                {
                    term: 'app.plugins.spp.sppGovernanceSettings.default.name',
                    definition: pluginName,
                },
                {
                    term: 'app.plugins.spp.sppGovernanceSettings.default.address',
                    definition: pluginAddress,
                },
            ]);
        });

        it('returns only pluginAddress term when pluginName is undefined', () => {
            const pluginAddress = '0x12345678';
            const pluginName = undefined;
            const result = sppSettingsUtils.getFallbackSettings({
                settings: { pluginAddress, pluginName },
                t: (key) => key,
            });

            expect(result).toEqual([
                {
                    term: 'app.plugins.spp.sppGovernanceSettings.default.address',
                    definition: pluginAddress,
                },
            ]);
        });
    });
});
