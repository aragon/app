import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { ISppPluginSettings } from '../../types';
import { sppSettingsUtils } from '../../utils/sppSettingsUtils/sppSettingsUtils';

export interface IUseSppGovernanceSettingsParams extends IUseGovernanceSettingsParams<ISppPluginSettings> {}

export const useSppGovernanceSettings = (params: IUseSppGovernanceSettingsParams): IDaoSettingTermAndDefinition[] => {
    const { settings } = params;

    const { t } = useTranslations();

    return sppSettingsUtils.parseSettings({ settings, t });
};
