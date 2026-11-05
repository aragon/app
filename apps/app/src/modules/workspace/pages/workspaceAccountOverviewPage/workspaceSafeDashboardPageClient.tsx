'use client';

import {
    Avatar,
    addressUtils,
    Button,
    CardEmptyState,
    IconType,
} from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import { safeShortNameFromNetwork } from '@/modules/application/utils/proxySafeUtils/safeTxServiceNetworks';
import { SafePendingTransactionList } from '@/modules/safe/components/safePendingTransactionList';
import type { Network } from '@/shared/api/daoService';
import { SafeServiceError, useSafeInfo } from '@/shared/api/safeService';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { WorkspaceAssetList } from '../../components/workspaceAssetList';
import { WorkspaceMemberList } from '../../components/workspaceMemberList';
import { WorkspaceSafeAsideCard } from '../../components/workspaceSafeAsideCard';
import { useWorkspaceAccountOptions } from '../../hooks/useWorkspaceAccountOptions';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceSafeDashboardPageClientProps {
    /**
     * ID of the workspace the account is looked at in.
     */
    workspaceId: string;
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe.
     */
    address: string;
}

const translationKey = 'app.workspace.workspaceSafeDashboardPage';

// The sizes of the DAO dashboard's previews, so both dashboards read alike.
const dashboardMembersCount = 6;
const dashboardAssetsCount = 3;

/**
 * Dashboard of a Safe account of a workspace, laid out as the DAO dashboard: a header with the account and the
 * threshold, owners and nonce of the Safe (the stats of the Safe account page), then the pending transactions in
 * place of the proposals — what a Safe has waiting on its owners — and previews of its owners and assets linking to
 * their pages. The aside is the Safe card of the transactions and assets pages, without its stats, which the header
 * already states.
 *
 * The pending transactions are read live from the Safe service, which some networks lack: there the section says so
 * and the rest of the page, read from the workspace endpoints, still renders.
 */
export const WorkspaceSafeDashboardPageClient: React.FC<
    IWorkspaceSafeDashboardPageClientProps
> = (props) => {
    const { workspaceId, network, address: rawAddress } = props;

    const { t } = useTranslations();
    const { activeOption, scopedAccounts, isPending } =
        useWorkspaceAccountOptions();

    // The Safe service requires a checksummed address, which the route does not guarantee.
    const address = addressUtils.getChecksum(rawAddress);

    const isSafeServed = safeShortNameFromNetwork(network) != null;
    const { data: safeInfo, error: safeInfoError } = useSafeInfo(
        { urlParams: { network, address } },
        { enabled: isSafeServed },
    );
    const isPendingUnavailable =
        !isSafeServed ||
        SafeServiceError.isUnsupportedChainError(safeInfoError);

    const account = activeOption?.account;
    const name = activeOption?.label ?? addressUtils.truncateAddress(address);
    const avatar =
        ipfsUtils.cidToSrc(account?.metadata?.avatar) ?? safeWallet.src;

    const accountId = workspaceUtils.buildAccountId({ network, address });
    const getSectionUrl = (section: string) =>
        workspaceUtils.getAccountScopeUrl(workspaceId, accountId, section);

    const assetAccounts = scopedAccounts.map((scopedAccount) => ({
        network: scopedAccount.network,
        address: scopedAccount.address,
    }));

    const stats = isPendingUnavailable
        ? undefined
        : [
              {
                  value: safeInfo?.threshold,
                  label: t(`${translationKey}.stats.threshold`),
              },
              {
                  value: safeInfo?.owners.length,
                  label: t(`${translationKey}.stats.owners`),
              },
              {
                  value: safeInfo?.nonce,
                  label: t(`${translationKey}.stats.nonce`),
              },
          ];

    return (
        <>
            <Page.Header
                avatar={<Avatar size="2xl" src={avatar} />}
                stats={stats}
                title={name}
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        description={t(
                            `${translationKey}.main.pending.description`,
                        )}
                        title={t(`${translationKey}.main.pending.title`)}
                    >
                        {isPendingUnavailable ? (
                            <CardEmptyState
                                description={t(
                                    `${translationKey}.main.pending.unavailable`,
                                    {
                                        network:
                                            networkDefinitions[network].name,
                                    },
                                )}
                                heading={t(
                                    `${translationKey}.main.pending.unavailableHeading`,
                                )}
                                objectIllustration={{ object: 'CHAIN' }}
                            />
                        ) : (
                            <SafePendingTransactionList
                                address={address}
                                currentNonce={safeInfo?.nonce}
                                network={network}
                                safeVersion={safeInfo?.version}
                                threshold={safeInfo?.threshold}
                            />
                        )}
                    </Page.MainSection>
                    <Page.MainSection
                        title={t(`${translationKey}.main.members.title`)}
                    >
                        <WorkspaceMemberList
                            accounts={scopedAccounts}
                            hidePagination={true}
                            pageSize={dashboardMembersCount}
                            workspaceId={workspaceId}
                        />
                        <Button
                            className="self-start"
                            href={getSectionUrl('members')}
                            iconRight={IconType.CHEVRON_RIGHT}
                            size="md"
                            variant="tertiary"
                        >
                            {t(`${translationKey}.main.viewAllMembers`)}
                        </Button>
                    </Page.MainSection>
                    <Page.MainSection
                        title={t(`${translationKey}.main.assets.title`)}
                    >
                        <WorkspaceAssetList
                            accounts={assetAccounts}
                            hidePagination={true}
                            isPending={isPending}
                            pageSize={dashboardAssetsCount}
                        />
                        <Button
                            className="self-start"
                            href={getSectionUrl('assets')}
                            iconRight={IconType.CHEVRON_RIGHT}
                            size="md"
                            variant="tertiary"
                        >
                            {t(`${translationKey}.main.viewAllAssets`)}
                        </Button>
                    </Page.MainSection>
                </Page.Main>
                {account != null && (
                    <Page.Aside>
                        <WorkspaceSafeAsideCard
                            account={account}
                            stats={[]}
                            title={name}
                        />
                    </Page.Aside>
                )}
            </Page.Content>
        </>
    );
};
