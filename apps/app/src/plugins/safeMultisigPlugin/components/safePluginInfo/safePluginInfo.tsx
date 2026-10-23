'use client';

import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
} from '@aragon/gov-ui-kit';
import {
    safeAppAccountUrl,
    safeShortNameFromNetwork,
} from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { safeSettingsUtils } from '@/modules/safe/utils/safeSettingsUtils';
import type { IDaoPlugInfoProps } from '@/modules/settings/components/daoPluginInfo';
import { useSafeInfo } from '@/shared/api/safeService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';

/**
 * Safe implementation of the plugin-info slot. A Safe is not an installed plugin, so the generic
 * contract/version rows do not apply: its configuration is read live from the Safe itself.
 */
export const SafePluginInfo: React.FC<IDaoPlugInfoProps> = (props) => {
    const { daoId, plugin } = props;

    const { network } = daoUtils.parseDaoId(daoId);
    const { t } = useTranslations();
    const { buildEntityUrl } = useDaoChain({ network });

    const address = addressUtils.getChecksum(plugin.address);
    const { data: safeInfo } = useSafeInfo(
        { urlParams: { network, address } },
        { enabled: safeShortNameFromNetwork(network) != null },
    );

    const safeHref =
        safeAppAccountUrl({ network, address }) ??
        buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });

    const rows = [
        safeSettingsUtils.addressRow({
            address,
            safeName: addressUtils.truncateAddress(address),
            safeHref,
            version: safeInfo?.version,
            t,
        }),
        ...(safeInfo == null
            ? []
            : safeSettingsUtils.liveConfigurationRows({ safeInfo, t })),
    ];

    return (
        <DefinitionList.Container>
            {rows.map((row) => (
                <DefinitionList.Item
                    copyValue={row.copyValue}
                    description={row.description}
                    key={row.term}
                    link={row.link}
                    term={row.term}
                >
                    {row.link == null ? (
                        <p className="text-neutral-500">{row.definition}</p>
                    ) : (
                        row.definition
                    )}
                </DefinitionList.Item>
            ))}
        </DefinitionList.Container>
    );
};
