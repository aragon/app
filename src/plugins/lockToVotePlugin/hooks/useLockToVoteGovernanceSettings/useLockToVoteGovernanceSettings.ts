import type { IDefinitionSetting } from '@aragon/gov-ui-kit';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useTokenTotalSupply } from '@/shared/hooks/useTokenTotalSupply';
import type { ILockToVotePluginSettings } from '../../types';
import { lockToVoteSettingsUtils } from '../../utils/lockToVoteSettingsUtils';

export interface IUseLockToVoteGovernanceSettingsParams
    extends IUseGovernanceSettingsParams<ILockToVotePluginSettings> {}

export const useLockToVoteGovernanceSettings = (
    params: IUseLockToVoteGovernanceSettingsParams,
): IDefinitionSetting[] => {
    const { settings, isVeto } = params;

    const { t } = useTranslations();
    const { chainId } = useDaoChain({ network: settings.token.network });
    const { data } = useTokenTotalSupply({
        chainId,
        address: settings.token.address,
    });

    return lockToVoteSettingsUtils.parseSettings({
        settings,
        isVeto,
        t,
        realTimeTotalSupply: data ? data.toString() : undefined,
    });
};
