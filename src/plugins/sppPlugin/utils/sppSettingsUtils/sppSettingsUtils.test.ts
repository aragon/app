import { generateSppStage } from '@/plugins/sppPlugin/testUtils';
import { mockTranslations } from '@/test/utils';
import { sppSettingsUtils } from './sppSettingsUtils';

describe('sppSettings utils', () => {
    describe('parseSettings', () => {
        it('returns the correct settings for the SPP plugin', () => {
            const stages = [generateSppStage(), generateSppStage(), generateSppStage()];
            const settings = { pluginAddress: '0x12345678', pluginName: 'My Plugin A', stages };
            const result = sppSettingsUtils.parseSettings({ settings, t: mockTranslations.tMock });
            expect(result).toEqual([{ term: 'app.plugins.spp.sppGovernanceSettings.numberOfStages', definition: '3' }]);
        });
    });

    describe('parseDefaultSettings', () => {
        it('returns both pluginName and pluginAddress terms when both are defined', () => {
            const address = '0x87654321';
            const name = 'My Plugin A';
            const url = 'https://etherscan.io/address/0x123';
            const link = { href: url };
            const result = sppSettingsUtils.parseDefaultSettings({ address, name, url, t: mockTranslations.tMock });

            expect(result).toEqual([
                { term: 'app.plugins.spp.sppGovernanceSettings.default.name', definition: name, link },
                { term: 'app.plugins.spp.sppGovernanceSettings.default.address', definition: address, link },
            ]);
        });

        it('returns only pluginAddress term when pluginName is undefined', () => {
            const address = '0x12345678';
            const name = undefined;
            const url = 'https://polygonscan.com/address/0x456';
            const link = { href: url };
            const result = sppSettingsUtils.parseDefaultSettings({ address, name, url, t: mockTranslations.tMock });

            expect(result).toEqual([
                { term: 'app.plugins.spp.sppGovernanceSettings.default.address', definition: address, link },
            ]);
        });
    });
});
