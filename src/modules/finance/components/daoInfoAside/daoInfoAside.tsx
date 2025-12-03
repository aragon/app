'use client';

import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { addressUtils, ChainEntityType, Collapsible, DefinitionList, Link } from '@aragon/gov-ui-kit';
import type { IDaoInfoAsideProps } from './daoInfoAside.api';

export const DaoInfoAside: React.FC<IDaoInfoAsideProps> = (props) => {
    const { network, daoId, subDao, dao, stats, ...otherProps } = props;

    const { t } = useTranslations();

    const resolvedNetwork = subDao?.network ?? dao?.network ?? network;
    const resolvedAddress = subDao?.address ?? dao?.address ?? '';
    const description = (subDao?.description ?? dao?.description)?.trim();
    const links = subDao?.links ?? dao?.links ?? [];

    const { buildEntityUrl } = useDaoChain({ network: resolvedNetwork, daoId });
    const pluginAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: resolvedAddress });

    return (
        <>
            {description && (
                <Collapsible
                    collapsedLines={2}
                    buttonLabelClosed={t('app.shared.page.header.readMore')}
                    buttonLabelOpened={t('app.shared.page.header.readLess')}
                >
                    {description}
                </Collapsible>
            )}
            {stats.length > 0 && (
                <div className="grid w-full grid-cols-2 gap-3">
                    {stats.map((stat) => (
                        <StatCard key={stat.label} value={stat.value} label={stat.label} />
                    ))}
                </div>
            )}
            <DefinitionList.Container {...otherProps}>
                <DefinitionList.Item term={t('app.finance.transactionSubDaoInfo.chain')}>
                    {networkDefinitions[resolvedNetwork].name}
                </DefinitionList.Item>
                <DefinitionList.Item
                    term={t('app.finance.transactionSubDaoInfo.address')}
                    copyValue={resolvedAddress}
                    link={{ href: pluginAddressLink }}
                >
                    {addressUtils.truncateAddress(resolvedAddress)}
                </DefinitionList.Item>
            </DefinitionList.Container>
            <div className="flex flex-col gap-3">
                {links.map((link) => (
                    <Link key={link.url} href={link.url} isExternal={true} showUrl={true}>
                        {link.name}
                    </Link>
                ))}
            </div>
        </>
    );
};
