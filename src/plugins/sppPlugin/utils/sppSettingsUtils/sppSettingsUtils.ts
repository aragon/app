import type { IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import type { IPluginSettings } from '../../../../shared/api/daoService';
import type { ISppPluginSettings } from '../../types';

export interface ISppSettingsParseParams {
    /**
     * Settings passed into the function either from the DAO or the proposal.
     */
    settings: ISppPluginSettings;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

export interface ISppSettingsFallbackParams {
    /**
     * Settings of an external plugin.
     */
    settings: IPluginSettings;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class SppSettingsUtils {
    parseSettings = (params: ISppSettingsParseParams): IDaoSettingTermAndDefinition[] => {
        const { settings, t } = params;

        const { stages } = settings;

        return [
            {
                term: t('app.plugins.spp.sppGovernanceSettings.numberOfStages'),
                definition: stages.length.toString(),
            },
        ];
    };

    /**
     * Currently related to external plugins, which are handled as fallbacks.
     */
    getFallbackSettings = (params: ISppSettingsFallbackParams): IDaoSettingTermAndDefinition[] => {
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

export const sppSettingsUtils = new SppSettingsUtils();
