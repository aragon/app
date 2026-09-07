'use client';

import {
    AddressOutput,
    Avatar,
    Card,
    Heading,
    Link,
    Spinner,
} from '@aragon/gov-ui-kit';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWorkspace } from '../../api/workspaceService';
import type { IWorkspaceNetworkAddress } from '../../utils/workspaceUtils';

export interface IWorkspaceDetailsPageClientProps {
    /**
     * ID of the workspace to display.
     */
    workspaceId: string;
}

/**
 * Minimal read-only workspace page, rendered client-side because the mocked registry lives on local storage and is
 * therefore not readable during a server prefetch (see `docs/projectDocs/createWorkspace.md`).
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

    if (isPending) {
        return (
            <Page.Main>
                <Spinner size="lg" variant="neutral" />
            </Page.Main>
        );
    }

    if (isError || workspace == null) {
        return (
            <Page.Main>
                <Card className="flex flex-col gap-2 border border-neutral-100 p-6">
                    <Heading as="h2" size="h3">
                        {t('app.workspace.workspaceDetailsPage.notFound.title')}
                    </Heading>
                    <p className="text-neutral-500 leading-normal">
                        {t(
                            'app.workspace.workspaceDetailsPage.notFound.description',
                            { id: workspaceId },
                        )}
                    </p>
                </Card>
            </Page.Main>
        );
    }

    const { name, description, avatar, links, accounts, targets } = workspace;

    const renderNetworkAddress = (
        entry: IWorkspaceNetworkAddress,
        key: string,
    ) => (
        <Card
            className="flex flex-col gap-1 border border-neutral-100 p-4"
            key={key}
        >
            <span className="text-neutral-500 text-sm leading-normal">
                {networkDefinitions[entry.network].name}
            </span>
            <AddressOutput address={entry.address} />
        </Card>
    );

    return (
        <Page.Main>
            <div className="flex flex-col gap-10">
                <div className="flex items-center gap-4">
                    <Avatar
                        alt={name}
                        size="2xl"
                        src={
                            avatar != null
                                ? ipfsUtils.cidToSrc(avatar)
                                : undefined
                        }
                    />
                    <div className="flex min-w-0 flex-col gap-2">
                        <Heading as="h1" size="h1">
                            {name}
                        </Heading>
                        {description !== '' && (
                            <p className="text-neutral-500 leading-normal">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                <section className="flex flex-col gap-3">
                    <Heading as="h2" size="h3">
                        {t('app.workspace.workspaceDetailsPage.accounts', {
                            count: accounts.length,
                        })}
                    </Heading>
                    {accounts.map((account) => (
                        <div className="flex flex-col gap-1" key={account.id}>
                            {account.metadata != null && (
                                <span className="text-base text-neutral-800 leading-tight">
                                    {account.metadata.name}
                                </span>
                            )}
                            {renderNetworkAddress(account, account.id)}
                        </div>
                    ))}
                </section>

                {targets.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <Heading as="h2" size="h3">
                            {t('app.workspace.workspaceDetailsPage.targets', {
                                count: targets.length,
                            })}
                        </Heading>
                        {targets.map((target) =>
                            renderNetworkAddress(
                                target,
                                `${target.network}-${target.address}`,
                            ),
                        )}
                    </section>
                )}

                {links.length > 0 && (
                    <section className="flex flex-col gap-3">
                        <Heading as="h2" size="h3">
                            {t('app.workspace.workspaceDetailsPage.links')}
                        </Heading>
                        {links.map((link) => (
                            <Link
                                href={link.url}
                                isExternal={true}
                                key={link.url}
                            >
                                {link.name === '' ? link.url : link.name}
                            </Link>
                        ))}
                    </section>
                )}
            </div>
        </Page.Main>
    );
};
