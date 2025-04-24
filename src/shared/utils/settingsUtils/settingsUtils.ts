import type { IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import type { IPluginSettings } from '@/shared/api/daoService';
import type { TranslationFunction } from '@/shared/components/translationsProvider';

export interface ISettingsUtilsParseParams {
    /**
     * Settings passed into the function either from the DAO or the proposal.
     */
    settings: IPluginSettings;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export class SettingsUtils {
    getFallbackSettings = (params: ISettingsUtilsParseParams): IDaoSettingTermAndDefinition[] => {
        const { settings, t } = params;
        const { pluginAddress, pluginName } = settings;
        const fallbackSettings: IDaoSettingTermAndDefinition[] = [];

        if (pluginName) {
            fallbackSettings.push({
                term: t('app.plugins.spp.sppGovernanceSettings.default.name'),
                definition: pluginName,
            });
        }

        fallbackSettings.push({
            term: t('app.plugins.spp.sppGovernanceSettings.default.address'),
            definition: pluginAddress,
        });

        return fallbackSettings;
    };
}

export const settingsUtils = new SettingsUtils();
