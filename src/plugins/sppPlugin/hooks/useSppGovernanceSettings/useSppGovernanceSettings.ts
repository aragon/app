import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { ISppPluginSettings } from '../../types';
import { sppSettingsUtils } from '../../utils/sppSettingsUtils';

export interface IUseSppGovernanceSettingsParams extends IUseGovernanceSettingsParams<ISppPluginSettings> {}

export const useSppGovernanceSettings = (params: IUseSppGovernanceSettingsParams): IDefinitionSetting[] => {
    const { settings } = params;

    const { t } = useTranslations();

    return sppSettingsUtils.parseSettings({ settings, t });
};
