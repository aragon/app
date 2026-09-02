'use client';

import { DaoAvatar, Wallet } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useState } from 'react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { useEnsName } from '@/modules/ens';
import type { IWorkspace } from '@/modules/workspace/api/workspaceService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type INavigationContainerProps,
    Navigation,
} from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWalletAccount } from '../../../hooks/useWalletAccount';
import { SupportChatTrigger } from '../../supportChat';
import { navigationWorkspaceUtils } from './navigationWorkspaceUtils';

export interface INavigationWorkspaceProps extends INavigationContainerProps {
    /**
     * Workspace to display the data for.
     */
    workspace: IWorkspace;
}

export const NavigationWorkspace: React.FC<INavigationWorkspaceProps> = (
    props,
) => {
    const { workspace, containerClasses, ...otherProps } = props;

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { data: displayName } = useEnsName(address, {
        stripAragonRegistrySuffix: true,
    });
    const isConnected = useWalletConnected();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected && address != null;
    const { open } = useDialogContext();

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
    const workspaceAvatar = ipfsUtils.cidToSrc(workspace.avatar);

    return (
        <Navigation.Container
            containerClasses={classNames(
                'flex flex-col gap-2 py-3 md:py-5 lg:gap-3',
                containerClasses,
            )}
            trailing={<SupportChatTrigger />}
            {...otherProps}
        >
            <div className="flex items-center justify-between gap-1">
                <button
                    className="focus-ring-primary flex max-w-56 cursor-pointer items-center gap-3 rounded-full border border-neutral-100 bg-neutral-0 p-1 text-neutral-500 transition-all hover:border-neutral-200 active:bg-neutral-50 active:text-neutral-800 md:pr-4 xl:max-w-68"
                    onClick={() => setIsDialogOpen(true)}
                    type="button"
                >
                    <DaoAvatar
                        name={workspace.name}
                        size="lg"
                        src={workspaceAvatar}
                    />
                    <p className="hidden truncate font-normal text-base text-neutral-800 leading-tight md:block">
                        {workspace.name}
                    </p>
                </button>
                <Navigation.Links
                    className="hidden lg:flex"
                    links={navigationWorkspaceUtils.buildLinks(
                        workspace,
                        'page',
                    )}
                />
                <div className="flex items-center gap-x-2 lg:gap-x-3">
                    <Wallet onClick={handleWalletClick} user={walletUser} />
                    <Navigation.Trigger
                        className="md:hidden"
                        onClick={() => setIsDialogOpen(true)}
                    />
                </div>
            </div>
            <Navigation.Dialog
                hiddenDescription={t(
                    'app.application.navigationWorkspace.a11y.description',
                )}
                hiddenTitle={t(
                    'app.application.navigationWorkspace.a11y.title',
                )}
                links={navigationWorkspaceUtils.buildLinks(workspace, 'dialog')}
                onOpenChange={setIsDialogOpen}
                open={isDialogOpen}
            >
                <div className="flex flex-col gap-3 px-8">
                    <DaoAvatar
                        name={workspace.name}
                        responsiveSize={{ sm: 'xl' }}
                        size="lg"
                        src={workspaceAvatar}
                    />
                    <div className="flex flex-col gap-1.5 font-normal leading-tight">
                        <p className="truncate text-lg text-neutral-800 sm:text-xl">
                            {workspace.name}
                        </p>
                        <p className="truncate text-neutral-500 text-sm sm:text-base">
                            {t('app.application.navigationWorkspace.accounts', {
                                count: workspace.accounts.length,
                            })}
                        </p>
                    </div>
                </div>
            </Navigation.Dialog>
        </Navigation.Container>
    );
};
