import type { IDaoSettingTermAndDefinition, IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { usePluginSettings } from '@/shared/hooks/usePluginSettings';
import type { ITokenPluginSettings } from '../../types';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface IUseTokenGovernanceSettingsParams extends IUseGovernanceSettingsParams<ITokenPluginSettings> {}

export const useTokenGovernanceSettings = (
    params: IUseTokenGovernanceSettingsParams,
): IDaoSettingTermAndDefinition[] => {
    const { daoId, settings } = params;

    const { t } = useTranslations();
    const currentSettings = usePluginSettings<ITokenPluginSettings>({ daoId });

    const processedSettings = settings ?? currentSettings;

    if (!processedSettings) {
        return [];
    }

    return tokenSettingsUtils.parseSettings({ settings: processedSettings, t });
};
