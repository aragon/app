'use client';

import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ChainEntityType, DefinitionList, addressUtils } from '@aragon/gov-ui-kit';
import type { ISubDaoInfoProps } from './subDaoInfo.api';

export const SubDaoInfo: React.FC<ISubDaoInfoProps> = (props) => {
    const { plugin, network, daoId, ...otherProps } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useDaoChain({ network });

    const pluginAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.address });
    const pluginName = daoUtils.getPluginName(plugin);

    return (
        <Page.AsideCard title={pluginName}>
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.subDaoInfo.chain')}>
                    <p className="text-neutral-500">{networkDefinitions[network].name}</p>
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.finance.subDaoInfo.pluginAddress')}
                    copyValue={plugin.address}
                    link={{ href: pluginAddressLink }}
                >
                    {addressUtils.truncateAddress(plugin.address)}
                </DefinitionList.Item>
                {plugin.description && (
                    <DefinitionList.Item term={t('app.finance.subDaoInfo.description')}>
                        <p className="text-sm text-neutral-500">{plugin.description}</p>
                    </DefinitionList.Item>
                )}
            </DefinitionList.Container>
        </Page.AsideCard>
    );
};
