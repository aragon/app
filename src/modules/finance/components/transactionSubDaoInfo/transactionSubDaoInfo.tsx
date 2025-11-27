'use client';

import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { addressUtils, ChainEntityType, DefinitionList } from '@aragon/gov-ui-kit';
import type { ITransactionSubDaoInfoProps } from './transactionSubDaoInfo.api';

export const TransactionSubDaoInfo: React.FC<ITransactionSubDaoInfoProps> = (props) => {
    const { plugin, network, daoId, ...otherProps } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useDaoChain({ network, daoId });
    const pluginAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: plugin.address });

    return (
        <DefinitionList.Container {...otherProps}>
            <DefinitionList.Item term={t('app.finance.transactionSubDaoInfo.chain')}>
                {networkDefinitions[network].name}
            </DefinitionList.Item>
            <DefinitionList.Item
                term={t('app.finance.transactionSubDaoInfo.pluginAddress')}
                copyValue={plugin.address}
                link={{ href: pluginAddressLink }}
            >
                {addressUtils.truncateAddress(plugin.address)}
            </DefinitionList.Item>
            {plugin.description && (
                <DefinitionList.Item term={t('app.finance.transactionSubDaoInfo.description')}>
                    {plugin.description}
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
