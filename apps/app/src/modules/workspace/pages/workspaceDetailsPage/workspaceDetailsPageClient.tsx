'use client';

import {
    AddressOutput,
    Card,
    DaoAvatar,
    DefinitionList,
    EmptyState,
    Link,
    Spinner,
} from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import { useWorkspace } from '../../api/workspaceService';
import { WorkspaceAccountItem } from '../../components/workspaceAccountItem';
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
 * Rendered client-side because the mocked registry lives on local storage and is therefore not readable during a
 * server prefetch (see `docs/projectDocs/createWorkspace.md`).
 */
export const WorkspaceDetailsPageClient: React.FC<
    IWorkspaceDetailsPageClientProps
> = (props) => {
    const { workspaceId } = props;

    const { t } = useTranslations();

    const {
        data: workspace,
        isPending,
        isError,
    } = useWorkspace({ urlParams: { id: workspaceId } }, { retry: false });

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

    if (isPending) {
        return (
            <Page.Main>
                <div className="flex justify-center py-20">
                    <Spinner size="lg" variant="neutral" />
                </div>
            </Page.Main>
        );
    }

    if (isError || workspace == null) {
        return (
            <Page.Main>
                <Card className="border border-neutral-100 py-10">
                    <EmptyState
                        description={t(
                            'app.workspace.workspaceDetailsPage.notFound.description',
                            { id: workspaceId },
                        )}
                        heading={t(
                            'app.workspace.workspaceDetailsPage.notFound.title',
                        )}
                        objectIllustration={{ object: 'MAGNIFYING_GLASS' }}
                    />
                </Card>
            </Page.Main>
        );
    }

    const { name, description, avatar, links, targets, owner } = workspace;

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
            />
            <Page.Content>
                <Page.Main>
                    <Page.MainSection
                        title={t(
                            'app.workspace.workspaceDetailsPage.section.accounts',
                        )}
                    >
                        <div className="flex flex-col gap-3 md:gap-2">
                            {accounts.map((account) => (
                                <WorkspaceAccountItem
                                    account={account}
                                    accountInfo={workspaceUtils.findAccountInfo(
                                        accountInfos,
                                        account,
                                    )}
                                    key={account.id}
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
                                        className="flex flex-col gap-1 border border-neutral-100 p-4 shadow-neutral-sm md:p-6"
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
                    <Page.AsideCard
                        title={t(
                            'app.workspace.workspaceDetailsPage.aside.details',
                        )}
                    >
                        <DefinitionList.Container>
                            <DefinitionList.Item
                                term={t(
                                    'app.workspace.workspaceDetailsPage.aside.owner',
                                )}
                            >
                                <AddressOutput address={owner} />
                            </DefinitionList.Item>
                        </DefinitionList.Container>
                    </Page.AsideCard>
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
