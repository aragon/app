import type { TranslationFunction } from '@/shared/components/translationsProvider';
import type { IDefinitionSetting } from '@aragon/gov-ui-kit';

export interface IAdminSettingsParseParams {
    /**
     * The translation function for internationalization.
     */
    t: TranslationFunction;
}

class AdminSettingsUtils {
    parseSettings = (params: IAdminSettingsParseParams): IDefinitionSetting[] => {
        const { t } = params;

        return [
            {
                term: t('app.plugins.admin.adminGovernanceSettings.proposalCreation'),
                definition: t('app.plugins.admin.adminGovernanceSettings.members'),
            },
            {
                term: t('app.plugins.admin.adminGovernanceSettings.proposalExecution'),
                definition: t('app.plugins.admin.adminGovernanceSettings.auto'),
            },
        ];
    };
}

export const adminSettingsUtils = new AdminSettingsUtils();
