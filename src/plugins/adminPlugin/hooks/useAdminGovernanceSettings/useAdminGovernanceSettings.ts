import { adminSettingsUtils } from '@/plugins/adminPlugin/utils/adminSettingsUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDefinitionSetting } from '@aragon/gov-ui-kit';

export const useAdminGovernanceSettings = (): IDefinitionSetting[] => {
    const { t } = useTranslations();

    return adminSettingsUtils.parseSettings({ t });
};
