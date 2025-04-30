import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useTranslations } from '@/shared/components/translationsProvider';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import { sppSettingsUtils } from '../../utils/sppSettingsUtils';

export interface IUseSppGovernanceSettingsDefaultParams extends IUseGovernanceSettingsParams {}

export const useSppGovernanceSettingsDefault = (params: IUseSppGovernanceSettingsDefaultParams) => {
    const { pluginAddress } = params;

    const { t } = useTranslations();
    const { data: bodyName } = useEnsName({ address: pluginAddress as Hex, chainId: mainnet.id });

    return sppSettingsUtils.parseDefaultSettings({ t, address: pluginAddress, name: bodyName ?? undefined });
};
