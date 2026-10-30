'use client';

import { Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { useEnsName } from '@/modules/ens';
import { WorkspaceAccountType } from '@/modules/workspace/api/workspaceService';
import { WorkspaceAccountSelector } from '@/modules/workspace/components/workspaceAccountSelector';
import { WorkspaceSelector } from '@/modules/workspace/components/workspaceSelector';
import { useWorkspaceAccountOptions } from '@/modules/workspace/hooks/useWorkspaceAccountOptions';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type INavigationContainerProps,
    Navigation,
} from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
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
 * Navigation of the workspace pages: the sidebar from the `lg` breakpoint, the navigation bar and its dialog below it.
 * Render it as the `navigation` of `LayoutSidebar`. The workspace and account selectors head the sidebar and, below
 * `lg`, the dialog: the bar only carries the dialog trigger and the wallet.
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
    const { open } = useDialogContext();

    // The links stay scoped to the account being looked at, so a tab change keeps the reader on it. The hook reads
    // the account from the route, which is where it lives, and falls back to the aggregated segment.
    const { accountId, activeOption } = useWorkspaceAccountOptions();

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

    // Built from the route, so the section links are complete on the first paint; the DAO-only ones (permissions,
    // settings) wait for the workspace read that tells a DAO account from a Safe.
    const links = navigationWorkspaceUtils.buildLinks(
        workspaceId,
        accountId,
        activeOption?.account?.type === WorkspaceAccountType.DAO,
    );
    const workspaceLinks =
        navigationWorkspaceUtils.buildWorkspaceLinks(workspaceId);

    return (
        <>
            <Navigation.Sidebar
                footer={
                    <>
                        <NavigationSidebarAccount
                            onClick={handleWalletClick}
                            user={walletUser}
                        />
                        <FooterSidebar />
                    </>
                }
                header={
                    <>
                        <WorkspaceSelector workspaceId={workspaceId} />
                        <WorkspaceAccountSelector workspaceId={workspaceId} />
                    </>
                }
                links={links}
                secondaryLinks={workspaceLinks}
            />
            <Navigation.Container
                className={classNames('lg:hidden', className)}
                containerClasses={classNames(
                    'flex flex-col gap-2 py-3 md:py-5',
                    containerClasses,
                )}
                {...otherProps}
            >
                <div className="flex items-center justify-between gap-1">
                    <Navigation.Trigger
                        className="shrink-0"
                        onClick={() => handleDialogOpenChange(true)}
                    />
                    <Wallet onClick={handleWalletClick} user={walletUser} />
                </div>
                <Navigation.Dialog
                    hiddenDescription={t(
                        'app.application.navigationWorkspace.a11y.description',
                    )}
                    hiddenTitle={t(
                        'app.application.navigationWorkspace.a11y.title',
                    )}
                    links={links}
                    onOpenChange={handleDialogOpenChange}
                    open={isDialogOpen}
                    secondaryLinks={workspaceLinks}
                >
                    <div className="flex flex-col gap-2 px-4">
                        <WorkspaceSelector workspaceId={workspaceId} />
                        <WorkspaceAccountSelector workspaceId={workspaceId} />
                    </div>
                </Navigation.Dialog>
            </Navigation.Container>
        </>
    );
};
