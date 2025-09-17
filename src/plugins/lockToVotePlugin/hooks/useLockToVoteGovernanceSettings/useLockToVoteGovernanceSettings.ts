import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { ILockToVotePluginSettings } from '../../types';
import { lockToVoteSettingsUtils } from '../../utils/lockToVoteSettingsUtils';

export interface IUseLockToVoteGovernanceSettingsParams
    extends IUseGovernanceSettingsParams<ILockToVotePluginSettings> {}

export const useLockToVoteGovernanceSettings = (
    params: IUseLockToVoteGovernanceSettingsParams,
): IDefinitionSetting[] => {
    const { settings, isVeto } = params;

    const { t } = useTranslations();

    return lockToVoteSettingsUtils.parseSettings({ settings, isVeto, t });
};
