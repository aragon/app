import type { IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
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
}

export const sppSettingsUtils = new SppSettingsUtils();
