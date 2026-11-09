'use client';

import {
    AddressOutput,
    Button,
    Card,
    DaoAvatar,
    EmptyState,
    IconType,
    Link,
    Tooltip,
} from '@aragon/gov-ui-kit';
import { CreateDaoDialogId } from '@/modules/createDao/constants/createDaoDialogId';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import {
    usePinnedWorkspaceId,
    useSetPinnedWorkspaceId,
    useWorkspace,
} from '../../api/workspaceService';
import { WorkspaceAccountItem } from '../../components/workspaceAccountItem';
import { WorkspaceWizardStep } from '../../constants/workspaceWizardStep';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceDetailsPageClientProps {
    /**
     * ID of the workspace to display.
     */
    workspaceId: string;
}

/**
 * Overview of a workspace: its metadata, the accounts it aggregates and its targets.
 *
 * This is the aggregated overview, which is also the state a workspace holding no DAO account is always in; the
 * dashboard of a single account is an account-scoped page of its own.
 *
 * Resolves the workspace client-side because the mocked registry lives on local storage and is therefore not
 * readable during a server prefetch (see `docs/projectDocs/createWorkspace.md`). It owns no loading or error state:
 * `WorkspaceGate` renders the pages only once that read has resolved and shows the error itself when it fails, so
 * the query below is served from the cache the gate has already filled.
 */
export const WorkspaceDetailsPageClient: React.FC<
    IWorkspaceDetailsPageClientProps
> = (props) => {
    const { workspaceId } = props;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });
    const {
        data: pinnedWorkspaceId = null,
        isPending: isPinnedWorkspacePending,
    } = usePinnedWorkspaceId();
    const { mutate: setPinnedWorkspaceId } = useSetPinnedWorkspaceId();

    const accounts = workspace?.accounts ?? [];

    // Resolved once for the whole list to display the DAO names, which the registry does not store.
    const { data: accountInfos } = useWorkspaceAccounts(
        {
            body: {
                accounts: accounts.map(({ network, address }) => ({
                    network,
                    address,
                })),
            },
        },
        { enabled: accounts.length > 0 },
    );

    // Narrows the type only; the gate above has already resolved the workspace.
    if (workspace == null) {
        return null;
    }

    const { name, description, avatar, links, targets } = workspace;
    const isPinned = pinnedWorkspaceId === workspaceId;
    const pinLabel = t(
        isPinned
            ? 'app.workspace.workspaceSelector.unpin'
            : 'app.workspace.workspaceSelector.pin',
    );

    return (
        <>
            <Page.Header
                avatar={
                    <DaoAvatar
                        name={name}
                        size="2xl"
                        src={ipfsUtils.cidToSrc(avatar)}
                    />
                }
                description={description}
                stats={[
                    {
                        label: t(
                            'app.workspace.workspaceDetailsPage.stat.accounts',
                        ),
                        value: accounts.length,
                    },
                    {
                        label: t(
                            'app.workspace.workspaceDetailsPage.stat.targets',
                        ),
                        value: targets.length,
                    },
                ]}
                title={name}
                titleAccessory={
                    !isPinnedWorkspacePending && (
                        <Tooltip content={pinLabel} triggerAsChild={true}>
                            <Button
                                aria-label={pinLabel}
                                iconLeft={
                                    isPinned
                                        ? IconType.FAVORITE_SELECTED
                                        : IconType.FAVORITE
                                }
                                onClick={() =>
                                    setPinnedWorkspaceId(
                                        isPinned ? null : workspaceId,
                                    )
                                }
                                size="md"
                                variant="ghost"
                            />
                        </Tooltip>
                    )
                }
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t(
                            'app.workspace.workspaceDetailsPage.section.accounts',
                        )}
                    >
                        {accounts.length === 0 && (
                            <Card className="py-10">
                                <EmptyState
                                    heading={t(
                                        'app.workspace.workspaceDetailsPage.emptyAccounts.heading',
                                    )}
                                    objectIllustration={{ object: 'BUILD' }}
                                    primaryButton={{
                                        label: t(
                                            'app.workspace.workspaceDetailsPage.emptyAccounts.action',
                                        ),
                                        href: workspaceUtils.getWorkspaceEditUrl(
                                            workspaceId,
                                            WorkspaceWizardStep.ACCOUNTS,
                                        ),
                                    }}
                                    secondaryButton={{
                                        label: t(
                                            'app.workspace.workspaceDetailsPage.emptyAccounts.createAction',
                                        ),
                                        onClick: () =>
                                            open(
                                                CreateDaoDialogId.CREATE_DAO_DETAILS,
                                            ),
                                    }}
                                />
                            </Card>
                        )}
                        <div className="flex flex-col gap-3 md:gap-2">
                            {accounts.map((account) => (
                                <WorkspaceAccountItem
                                    account={account}
                                    accountInfo={workspaceUtils.findAccountInfo(
                                        accountInfos,
                                        account,
                                    )}
                                    key={account.id}
                                    workspaceId={workspaceId}
                                />
                            ))}
                        </div>
                    </Page.MainSection>
                    {targets.length > 0 && (
                        <Page.MainSection
                            description={t(
                                'app.workspace.workspaceDetailsPage.section.targetsDescription',
                            )}
                            title={t(
                                'app.workspace.workspaceDetailsPage.section.targets',
                            )}
                        >
                            <div className="flex flex-col gap-3 md:gap-2">
                                {targets.map((target) => (
                                    <Card
                                        className="flex flex-col gap-1 p-4 shadow-neutral-sm md:p-6"
                                        key={`${target.network}-${target.address}`}
                                    >
                                        <span className="text-neutral-500 text-sm leading-normal">
                                            {
                                                networkDefinitions[
                                                    target.network
                                                ].name
                                            }
                                        </span>
                                        <AddressOutput
                                            address={target.address}
                                        />
                                    </Card>
                                ))}
                            </div>
                        </Page.MainSection>
                    )}
                </Page.Main>
                <Page.Aside>
                    {links.length > 0 && (
                        <Page.AsideCard
                            title={t(
                                'app.workspace.workspaceDetailsPage.aside.resources',
                            )}
                        >
                            <div className="flex flex-col gap-3">
                                {links.map((link) => (
                                    <Link
                                        href={link.url}
                                        isExternal={true}
                                        key={link.url}
                                        showUrl={true}
                                    >
                                        {link.name === ''
                                            ? link.url
                                            : link.name}
                                    </Link>
                                ))}
                            </div>
                        </Page.AsideCard>
                    )}
                </Page.Aside>
            </Page.Content>
        </>
    );
};
