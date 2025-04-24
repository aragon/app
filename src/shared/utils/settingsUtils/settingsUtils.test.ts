import { settingsUtils } from './settingsUtils';

describe('SettingsUtils', () => {
    describe('getFallbackSettings', () => {
        it('returns both pluginName and pluginAddress terms when both are defined', () => {
            const pluginAddress = '0x87654321';
            const pluginName = 'My Plugin A';
            const result = settingsUtils.getFallbackSettings({
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
            const result = settingsUtils.getFallbackSettings({
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
