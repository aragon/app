import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import { adminSettingsUtils } from '@/plugins/adminPlugin/utils/adminSettingsUtils';
import { useTranslations } from '@/shared/components/translationsProvider';

export const useAdminGovernanceSettings = (): IDefinitionSetting[] => {
    const { t } = useTranslations();

    return adminSettingsUtils.parseSettings({ t });
};
