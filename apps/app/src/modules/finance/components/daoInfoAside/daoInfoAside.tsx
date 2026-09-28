'use client';

import {
    Button,
    ChainEntityType,
    Collapsible,
    DefinitionList,
    IconType,
} from '@aragon/gov-ui-kit';
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';
import { ResourceLink } from '@/shared/components/resourceLink';
import { StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { FinanceDetailsList } from '../financeDetailsList';
import type { IDaoInfoAsideProps } from './daoInfoAside.api';

export const DaoInfoAside: React.FC<IDaoInfoAsideProps> = (props) => {
    const { network, daoId, linkedAccount, dao, stats, ...otherProps } = props;

    const { t } = useTranslations();

    const { isEnabled } = useFeatureFlags();

    const isLinkedAccountEnabled = isEnabled('linkedAccount');

    const resolvedNetwork = linkedAccount?.network ?? dao?.network ?? network;
    const resolvedAddress = linkedAccount?.address ?? dao?.address ?? '';
    const description = (
        linkedAccount?.description ?? dao?.description
    )?.trim();
    const links = linkedAccount?.links ?? dao?.links ?? [];

    const { buildEntityUrl } = useDaoChain({ network: resolvedNetwork, daoId });
    const pluginAddressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: resolvedAddress,
    });
    const resolvedOctavLink = resolvedAddress
        ? `https://pro.octav.fi/?addresses=${resolvedAddress}`
        : '';

    if (isLinkedAccountEnabled) {
        return (
            <>
                {description && (
                    <Collapsible
                        buttonLabelClosed={t('app.shared.page.header.readMore')}
                        buttonLabelOpened={t('app.shared.page.header.readLess')}
                        collapsedLines={2}
                    >
                        {description}
                    </Collapsible>
                )}
                {stats.length > 0 && (
                    <div className="grid w-full grid-cols-2 gap-3">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                label={stat.label}
                                value={stat.value}
                            />
                        ))}
                    </div>
                )}
                <DefinitionList.Container {...otherProps}>
                    <DefinitionList.Item
                        term={t(
                            'app.finance.transactionLinkedAccountInfo.chain',
                        )}
                    >
                        {networkDefinitions[resolvedNetwork].name}
                    </DefinitionList.Item>
                    <DefinitionList.Item
                        link={{
                            href: pluginAddressLink,
                            isOnchainEntity: true,
                        }}
                        term={t(
                            'app.finance.transactionLinkedAccountInfo.address',
                        )}
                    >
                        {resolvedAddress}
                    </DefinitionList.Item>
                </DefinitionList.Container>

                <div className="flex flex-col gap-3">
                    {links.map((link) => (
                        <ResourceLink
                            isExternal={true}
                            key={link.url}
                            name={link.name}
                            url={link.url}
                        />
                    ))}
                </div>
                {resolvedOctavLink && (
                    <div className="flex flex-col items-center gap-y-3 pt-4">
                        <Button
                            className="w-full"
                            href={resolvedOctavLink}
                            iconRight={IconType.LINK_EXTERNAL}
                            size="md"
                            target="_blank"
                            variant="tertiary"
                        >
                            {t('app.finance.financeDetailsList.octavLabel')}
                        </Button>
                        <p className="text-neutral-500 text-sm">
                            {t(
                                'app.finance.financeDetailsList.octavDescription',
                            )}
                        </p>
                    </div>
                )}
            </>
        );
    }

    return <FinanceDetailsList dao={dao} />;
};
