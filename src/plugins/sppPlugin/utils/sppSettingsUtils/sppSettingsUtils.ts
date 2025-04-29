import type { IDaoSettingTermAndDefinition } from '@/modules/settings/types';
import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { addressUtils, type ILinkProps } from '@aragon/gov-ui-kit';
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

export interface ISppSettingsParseDefaultParams {
    /**
     * Address of the body.
     */
    address: string;
    /**
     * ENS name of the body.
     */
    name?: string;
    /**
     * Link to the deployed plugin.
     */
    link?: ILinkProps;
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
            { term: t('app.plugins.spp.sppGovernanceSettings.numberOfStages'), definition: stages.length.toString() },
        ];
    };

    parseDefaultSettings = (params: ISppSettingsParseDefaultParams): IDaoSettingTermAndDefinition[] => {
        const { address, name, link, t } = params;

        const settings: IDaoSettingTermAndDefinition[] = [
            {
                term: t('app.plugins.spp.sppGovernanceSettings.default.address'),
                definition: addressUtils.truncateAddress(address),
                link,
            },
        ];

        if (name != null) {
            settings.unshift({ term: t('app.plugins.spp.sppGovernanceSettings.default.name'), definition: name, link });
        }

        return settings;
    };
}

export const sppSettingsUtils = new SppSettingsUtils();
