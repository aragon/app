import { ChainEntityType } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { mainnet } from 'viem/chains';
import { useEnsName } from 'wagmi';
import type { IUseGovernanceSettingsParams } from '@/modules/settings/types';
import { useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { sppSettingsUtils } from '../../utils/sppSettingsUtils';

export interface IUseSppGovernanceSettingsDefaultParams
    extends IUseGovernanceSettingsParams {}

export const useSppGovernanceSettingsDefault = (
    params: IUseSppGovernanceSettingsDefaultParams,
) => {
    const { pluginAddress, daoId } = params;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { buildEntityUrl } = useDaoChain({ network: dao?.network });

    const { data: bodyName } = useEnsName({
        address: pluginAddress as Hex,
        chainId: mainnet.id,
    });
    const url = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: pluginAddress,
    })!;

    return sppSettingsUtils.parseDefaultSettings({
        t,
        address: pluginAddress,
        name: bodyName ?? undefined,
        url,
    });
};
