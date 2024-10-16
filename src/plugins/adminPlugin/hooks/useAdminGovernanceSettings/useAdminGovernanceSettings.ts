import { adminSettingsUtils } from '@/plugins/adminPlugin/utils/adminSettingsUtils';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDaoSettingTermAndDefinition } from '../../../../modules/settings/types';

export const useAdminGovernanceSettings = (): IDaoSettingTermAndDefinition[] => {
    const { t } = useTranslations();

    return adminSettingsUtils.parseSettings({ t });
};
