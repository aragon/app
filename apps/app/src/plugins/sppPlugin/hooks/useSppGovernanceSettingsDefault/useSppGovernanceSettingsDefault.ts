import {
    ChainEntityType,
    formatAddressText,
    useResolveAddress,
} from '@aragon/gov-ui-kit';
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

    // The name row shows only when the address book or ENS names the body; the address row always shows.
    const { label, source, sourceLabel } = useResolveAddress(pluginAddress);
    const url = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: pluginAddress,
    })!;

    return sppSettingsUtils.parseDefaultSettings({
        t,
        address: pluginAddress,
        name:
            label != null && source != null
                ? formatAddressText({ label, source, sourceLabel })
                : undefined,
        url,
    });
};
