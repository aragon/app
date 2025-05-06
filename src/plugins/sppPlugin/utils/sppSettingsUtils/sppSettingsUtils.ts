import type { TranslationFunction } from '@/shared/components/translationsProvider';
import { addressUtils, type IDefinitionSetting } from '@aragon/gov-ui-kit';
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
     * Link to the deployed body.
     */
    url: string;
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class SppSettingsUtils {
    parseSettings = (params: ISppSettingsParseParams): IDefinitionSetting[] => {
        const { settings, t } = params;
        const { stages } = settings;

        return [
            { term: t('app.plugins.spp.sppGovernanceSettings.numberOfStages'), definition: stages.length.toString() },
        ];
    };

    parseDefaultSettings = (params: ISppSettingsParseDefaultParams): IDefinitionSetting[] => {
        const { address, name, url, t } = params;

        const link = { href: url };
        const truncatedAddress = addressUtils.truncateAddress(address);

        const settings: IDefinitionSetting[] = [
            { term: t('app.plugins.spp.sppGovernanceSettings.default.address'), definition: truncatedAddress, link },
        ];

        if (name != null) {
            settings.unshift({ term: t('app.plugins.spp.sppGovernanceSettings.default.name'), definition: name, link });
        }

        return settings;
    };
}

export const sppSettingsUtils = new SppSettingsUtils();
