'use client';

import {
    Button,
    ChainEntityType,
    Collapsible,
    DefinitionList,
    IconType,
} from '@aragon/gov-ui-kit';
import { safeAppAccountUrl } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { Page } from '@/shared/components/page';
import { type IStatCardProps, StatCard } from '@/shared/components/statCard';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import type { IWorkspaceAccount } from '../../api/workspaceService';

export interface IWorkspaceSafeAsideCardProps {
    /**
     * Safe account selected on the page.
     */
    account: IWorkspaceAccount;
    /**
     * Title of the card, i.e. the label of the selected account option.
     */
    title: string;
    /**
     * Stats of the page the card is displayed on, e.g. transaction or asset totals.
     */
    stats: IStatCardProps[];
}

/**
 * Aside card of a Safe account of a workspace, mirroring the data of the DAO card (`DaoInfoAside`): description,
 * stats, chain, address and Octav link. Each page passes its own stats, so the same card serves the transactions and
 * assets pages.
 *
 * A Safe has no on-chain metadata, so the description is the one stored on the workspace account.
 */
export const WorkspaceSafeAsideCard: React.FC<IWorkspaceSafeAsideCardProps> = (
    props,
) => {
    const { account, title, stats } = props;
    const { network, address, metadata } = account;

    const { t } = useTranslations();

    const { buildEntityUrl } = useDaoChain({ network });
    // The Safe app, as on the Safe account page and a Safe body's settings: it is where the account is worked with,
    // while the explorer only renders the address. Networks with no Safe app fall back to the explorer.
    const addressLink =
        safeAppAccountUrl({ network, address }) ??
        buildEntityUrl({ type: ChainEntityType.ADDRESS, id: address });

    const octavLink = `https://pro.octav.fi/?addresses=${address}`;

    const description = metadata?.description?.trim();

    return (
        <Page.AsideCard title={title}>
            {description && (
                <Collapsible
                    buttonLabelClosed={t('app.shared.page.header.readMore')}
                    buttonLabelOpened={t('app.shared.page.header.readLess')}
                    collapsedLines={2}
                >
                    {description}
                </Collapsible>
            )}
            <div className="grid w-full grid-cols-2 gap-3">
                {stats.map((stat) => (
                    <StatCard
                        key={stat.label}
                        label={stat.label}
                        suffix={stat.suffix}
                        value={stat.value}
                    />
                ))}
            </div>
            <DefinitionList.Container>
                <DefinitionList.Item
                    term={t('app.finance.transactionLinkedAccountInfo.chain')}
                >
                    {networkDefinitions[network].name}
                </DefinitionList.Item>
                <DefinitionList.Item
                    copyValue={address}
                    link={{
                        href: addressLink,
                        isExternal: true,
                        isOnchainEntity: true,
                    }}
                    term={t('app.finance.transactionLinkedAccountInfo.address')}
                >
                    {address}
                </DefinitionList.Item>
            </DefinitionList.Container>
            <div className="flex flex-col items-center gap-y-3 pt-4">
                <Button
                    className="w-full"
                    href={octavLink}
                    iconRight={IconType.LINK_EXTERNAL}
                    size="md"
                    target="_blank"
                    variant="tertiary"
                >
                    {t('app.finance.financeDetailsList.octavLabel')}
                </Button>
                <p className="text-neutral-500 text-sm">
                    {t('app.finance.financeDetailsList.octavDescription')}
                </p>
            </div>
        </Page.AsideCard>
    );
};
