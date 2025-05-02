import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ChainEntityType, useBlockExplorer } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import { sppSettingsUtils } from '../../utils/sppSettingsUtils';

export interface IUseSppGovernanceSettingsDefaultParams extends IUseGovernanceSettingsParams {}

export const useSppGovernanceSettingsDefault = (params: IUseSppGovernanceSettingsDefaultParams) => {
    const { pluginAddress, daoId } = params;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { id: chainId } = networkDefinitions[dao!.network];
    const { buildEntityUrl } = useBlockExplorer({ chainId });

    const { data: bodyName } = useEnsName({ address: pluginAddress as Hex, chainId: mainnet.id });
    const url = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: pluginAddress })!;

    return sppSettingsUtils.parseDefaultSettings({ t, address: pluginAddress, name: bodyName ?? undefined, url });
};
