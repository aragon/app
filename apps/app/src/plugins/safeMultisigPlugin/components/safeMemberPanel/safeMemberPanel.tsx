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
import { brandedExternals } from '@/plugins/sppPlugin/constants/sppPluginBrandedExternals';
import { VotingBodyBrandIdentity } from '@/plugins/sppPlugin/types';
import { useSafeInfo } from '@/shared/api/safeService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import type { ISafeMemberPanelProps } from './safeMemberPanel.api';

export const SafeMemberPanel: React.FC<ISafeMemberPanelProps> = (props) => {
    const { daoId, pluginAddress } = props;
    const { network } = daoUtils.parseDaoId(daoId);
    const { t } = useTranslations();
    const { buildEntityUrl } = useDaoChain({ network });
    const address = addressUtils.getChecksum(pluginAddress);
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

    const title =
        brandedExternals[VotingBodyBrandIdentity.SAFE]?.label ?? 'Safe';

    return (
        <Page.AsideCard title={title}>
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
        </Page.AsideCard>
    );
};

export type { ISafeMemberPanelProps } from './safeMemberPanel.api';
