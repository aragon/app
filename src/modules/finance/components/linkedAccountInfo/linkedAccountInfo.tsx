'use client';

import {
    addressUtils,
    ChainEntityType,
    DefinitionList,
} from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import type { ILinkedAccountInfoProps } from './linkedAccountInfo.api';

export const LinkedAccountInfo: React.FC<ILinkedAccountInfoProps> = (props) => {
    const { plugin, network, ...otherProps } = props;

    const { t } = useTranslations();
    const { buildEntityUrl } = useDaoChain({ network });

    const pluginAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: plugin.address,
    });

    return (
        <DefinitionList.Container {...otherProps}>
            <DefinitionList.Item
                term={t('app.finance.linkedAccountInfo.chain')}
            >
                {networkDefinitions[network].name}
            </DefinitionList.Item>
            <DefinitionList.Item
                copyValue={plugin.address}
                link={{ href: pluginAddressLink }}
                term={t('app.finance.linkedAccountInfo.pluginAddress')}
            >
                {addressUtils.truncateAddress(plugin.address)}
            </DefinitionList.Item>
            {plugin.description && (
                <DefinitionList.Item
                    term={t('app.finance.linkedAccountInfo.description')}
                >
                    {plugin.description}
                </DefinitionList.Item>
            )}
        </DefinitionList.Container>
    );
};
