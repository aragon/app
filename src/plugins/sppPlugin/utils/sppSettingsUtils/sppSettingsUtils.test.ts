import { generateSppStage } from '@/plugins/sppPlugin/testUtils';
import { mockTranslations } from '@/test/utils';
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

    describe('parseDefaultSettings', () => {
        it('returns both pluginName and pluginAddress terms when both are defined', () => {
            const address = '0x87654321';
            const name = 'My Plugin A';
            const result = sppSettingsUtils.parseDefaultSettings({ address, name, t: mockTranslations.tMock });

            expect(result).toEqual([
                { term: 'app.plugins.spp.sppGovernanceSettings.default.name', definition: name },
                { term: 'app.plugins.spp.sppGovernanceSettings.default.address', definition: address },
            ]);
        });

        it('returns only pluginAddress term when pluginName is undefined', () => {
            const address = '0x12345678';
            const name = undefined;
            const result = sppSettingsUtils.parseDefaultSettings({ address, name, t: mockTranslations.tMock });

            expect(result).toEqual([
                { term: 'app.plugins.spp.sppGovernanceSettings.default.address', definition: address },
            ]);
        });
    });
});
