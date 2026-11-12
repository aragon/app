'use client';

import {
    DaoAvatar,
    Dropdown,
    Icon,
    IconType,
    Wallet,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { useEnsName } from '@/modules/ens';
import { useWorkspace } from '@/modules/workspace/api/workspaceService';
import { WorkspaceAccountSelector } from '@/modules/workspace/components/workspaceAccountSelector';
import { WorkspaceSelector } from '@/modules/workspace/components/workspaceSelector';
import { useWorkspaceAccountOptions } from '@/modules/workspace/hooks/useWorkspaceAccountOptions';
import { useWorkspaceTodoData } from '@/modules/workspace/hooks/useWorkspaceTodoData';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type INavigationContainerProps,
    type INavigationLinkGroup,
    Navigation,
} from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWalletAccount } from '../../../hooks/useWalletAccount';
import { FooterSidebar } from '../../footer';
import { NavigationSidebarAccount } from '../navigationSidebarAccount';
import { navigationWorkspaceUtils } from './navigationWorkspaceUtils';

export interface INavigationWorkspaceProps extends INavigationContainerProps {
    /**
     * ID of the workspace to display the data for.
     */
    workspaceId: string;
}

/**
 * Navigation of the workspace pages: the sidebar from the `lg` breakpoint, the navigation bar and its dialog below
 * it. The workspace and account selectors head the sidebar and dialog; the bar carries a compact selector that opens
 * that same dialog plus the wallet.
 *
 * Every section link is built from the workspace ID on the route, so the navigation is usable from the first paint on
 * a cold load, before the workspace registry (local storage, see `docs/projectDocs/createWorkspace.md`) is read.
 */
export const NavigationWorkspace: React.FC<INavigationWorkspaceProps> = (
    props,
) => {
    const { workspaceId, className, containerClasses, ...otherProps } = props;

    // The dialog stays open on the pathname it was opened on: picking a workspace or account from its selectors is a
    // navigation, which closes it.
    const pathname = usePathname();
    const [dialogPathname, setDialogPathname] = useState<string>();
    const isDialogOpen = dialogPathname === pathname;
    const handleDialogOpenChange = (isOpen: boolean) =>
        setDialogPathname(isOpen ? pathname : undefined);

    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { data: displayName } = useEnsName(address, {
        stripAragonRegistrySuffix: true,
    });
    const isConnected = useWalletConnected();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected && address != null;
    const { data: workspace } = useWorkspace({
        urlParams: { id: workspaceId },
    });
    const { open } = useDialogContext();

    // The links stay scoped to the account being looked at, so a tab change keeps the reader on it. The hook reads
    // the account from the route, which is where it lives, and falls back to the aggregated segment.
    const { accountId, activeOption, scopedAccounts } =
        useWorkspaceAccountOptions();

    const handleWalletClick = () => {
        const dialog = effectiveIsConnected
            ? ApplicationDialogId.USER
            : ApplicationDialogId.CONNECT_WALLET;
        open(dialog);
    };

    const walletUser =
        isMounted && address != null
            ? { address, name: displayName ?? undefined }
            : undefined;

    // The to-dos of the wallet in the scope the to-dos link opens, for its badge. Read under the same query as the
    // to-dos page and the overview, so the badge counts the rows its link leads to at no extra request.
    const { todos } = useWorkspaceTodoData({
        accounts: scopedAccounts,
        address: effectiveIsConnected ? address : undefined,
    });

    // Three groups: the wallet's inbox (hidden with its label until a wallet connects), the sections of the account in
    // scope under the name of the workspace, and the workspace itself. The section links are built from the route,
    // so they are complete on the first paint; under an account scope, the ones served for some account types alone
    // (proposals, permissions, settings) wait for the workspace read that tells a DAO account from a Safe.
    const groups: INavigationLinkGroup[] = [
        {
            id: 'inbox',
            label: t('app.application.navigationWorkspace.group.inbox'),
            links: navigationWorkspaceUtils.buildInboxLinks(
                workspaceId,
                accountId,
                {
                    isConnected: effectiveIsConnected,
                    count: todos.length,
                },
            ),
        },
        {
            id: 'account',
            label: workspace?.name,
            links: navigationWorkspaceUtils.buildLinks(
                workspaceId,
                accountId,
                activeOption?.account?.type,
            ),
        },
        {
            id: 'workspace',
            label: t('app.application.navigationWorkspace.group.workspace'),
            links: navigationWorkspaceUtils.buildWorkspaceLinks(workspaceId),
        },
    ];

    return (
        <>
            <Navigation.Sidebar
                footer={
                    <>
                        {workspace != null ? (
                            <NavigationSidebarAccount
                                onClick={handleWalletClick}
                                user={walletUser}
                            />
                        ) : null}
                        <FooterSidebar />
                    </>
                }
                groups={groups}
                header={
                    <Dropdown.Group>
                        <WorkspaceSelector workspaceId={workspaceId} />
                        <WorkspaceAccountSelector workspaceId={workspaceId} />
                    </Dropdown.Group>
                }
            />
            <Navigation.Container
                className={classNames('lg:hidden', className)}
                containerClasses={classNames(
                    'flex flex-col gap-2 py-3 md:py-5',
                    containerClasses,
                )}
                {...otherProps}
            >
                <div className="flex items-center justify-between gap-3">
                    <button
                        aria-expanded={isDialogOpen}
                        aria-haspopup="dialog"
                        className="focus-ring-primary flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-0 p-1.5 pr-2 text-neutral-500 shadow-neutral-sm transition-all hover:border-neutral-200 hover:bg-neutral-50 hover:shadow-neutral active:border-neutral-400 active:bg-neutral-0 active:text-neutral-800 md:gap-3 md:rounded-xl md:p-2 md:pr-3"
                        onClick={() => handleDialogOpenChange(true)}
                        type="button"
                    >
                        <DaoAvatar
                            className="shrink-0"
                            name={workspace?.name}
                            responsiveSize={{ md: 'md' }}
                            size="sm"
                            src={ipfsUtils.cidToSrc(workspace?.avatar)}
                        />
                        <span className="flex min-w-0 flex-col text-left leading-tight">
                            <span className="truncate text-neutral-800 text-sm md:text-base">
                                {workspace?.name}
                            </span>
                            <span className="truncate text-xs md:text-sm">
                                {activeOption?.label}
                            </span>
                        </span>
                        <span
                            aria-hidden={true}
                            className="flex shrink-0 flex-col items-center -space-y-1"
                        >
                            <Icon icon={IconType.CHEVRON_UP} size="sm" />
                            <Icon icon={IconType.CHEVRON_DOWN} size="sm" />
                        </span>
                    </button>
                    {workspace != null ? (
                        <Wallet onClick={handleWalletClick} user={walletUser} />
                    ) : null}
                </div>
                <Navigation.Dialog
                    groups={groups}
                    hiddenDescription={t(
                        'app.application.navigationWorkspace.a11y.description',
                    )}
                    hiddenTitle={t(
                        'app.application.navigationWorkspace.a11y.title',
                    )}
                    onOpenChange={handleDialogOpenChange}
                    open={isDialogOpen}
                >
                    <div className="px-4">
                        <Dropdown.Group>
                            <WorkspaceSelector workspaceId={workspaceId} />
                            <WorkspaceAccountSelector
                                workspaceId={workspaceId}
                            />
                        </Dropdown.Group>
                    </div>
                </Navigation.Dialog>
            </Navigation.Container>
        </>
    );
};
