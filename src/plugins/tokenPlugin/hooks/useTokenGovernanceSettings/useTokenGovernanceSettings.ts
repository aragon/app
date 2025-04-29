import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { ITokenPluginSettings } from '../../types';
import { tokenSettingsUtils } from '../../utils/tokenSettingsUtils';

export interface IUseTokenGovernanceSettingsParams extends IUseGovernanceSettingsParams<ITokenPluginSettings> {}

export const useTokenGovernanceSettings = (params: IUseTokenGovernanceSettingsParams): IDefinitionSetting[] => {
    const { settings } = params;

    const { t } = useTranslations();

    return tokenSettingsUtils.parseSettings({ settings, t });
};
