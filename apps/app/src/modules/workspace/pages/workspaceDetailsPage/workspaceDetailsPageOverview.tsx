'use client';

import {
    AddressOutput,
    Card,
    DaoAvatar,
    DefinitionList,
    Link,
} from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspaceAccounts } from '../../api/workspaceQueryService';
import type { IWorkspace } from '../../api/workspaceService';
import { WorkspaceAccountItem } from '../../components/workspaceAccountItem';
import { workspaceUtils } from '../../utils/workspaceUtils';

export interface IWorkspaceDetailsPageOverviewProps {
    /**
     * Workspace to display the overview of.
     */
    workspace: IWorkspace;
}

/**
 * Overview of a workspace: its metadata, the accounts it aggregates and its targets.
 *
 * Shown when the workspace navigation aggregates every account, which is also the state a workspace holding no DAO
 * account is always in.
 */
export const WorkspaceDetailsPageOverview: React.FC<
    IWorkspaceDetailsPageOverviewProps
> = (props) => {
    const { workspace } = props;

    const { t } = useTranslations();

    const { name, description, avatar, links, targets, owner, accounts } =
        workspace;

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
