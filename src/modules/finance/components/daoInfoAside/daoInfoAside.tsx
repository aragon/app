'use client';

import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { addressUtils, Button, ChainEntityType, Collapsible, DefinitionList, IconType, Link } from '@aragon/gov-ui-kit';
import { FinanceDetailsList } from '../financeDetailsList';
import type { IDaoInfoAsideProps } from './daoInfoAside.api';

export const DaoInfoAside: React.FC<IDaoInfoAsideProps> = (props) => {
    const { network, daoId, subDao, dao, stats, ...otherProps } = props;

    const { t } = useTranslations();

    const { isEnabled } = useFeatureFlags();

    const isSubDaoEnabled = isEnabled('subDao');

    const resolvedNetwork = subDao?.network ?? dao?.network ?? network;
    const resolvedAddress = subDao?.address ?? dao?.address ?? '';
    const description = (subDao?.description ?? dao?.description)?.trim();
    const links = subDao?.links ?? dao?.links ?? [];

    const { buildEntityUrl } = useDaoChain({ network: resolvedNetwork, daoId });
    const pluginAddressLink = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: resolvedAddress });
    const resolvedOctavLink = resolvedAddress ? `https://pro.octav.fi/?addresses=${resolvedAddress}` : '';

    if (isSubDaoEnabled) {
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
                {resolvedOctavLink && (
                    <div className="flex flex-col items-center gap-y-3 pt-4">
                        <Button
                            className="w-full"
                            variant="tertiary"
                            size="md"
                            href={resolvedOctavLink}
                            target="_blank"
                            iconRight={IconType.LINK_EXTERNAL}
                        >
                            {t('app.finance.financeDetailsList.octavLabel')}
                        </Button>
                        <p className="text-sm text-neutral-500">
                            {t('app.finance.financeDetailsList.octavDescription')}
                        </p>
                    </div>
                )}
            </>
        );
    }

    return <FinanceDetailsList dao={dao} />;
};
