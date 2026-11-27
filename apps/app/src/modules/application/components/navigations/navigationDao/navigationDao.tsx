'use client';

import {
    AddressOutput,
    ChainEntityType,
    DaoAvatar,
    Tooltip,
    Wallet,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { ApplicationDialogId } from '@/modules/application/constants/applicationDialogId';
import { useWalletConnected } from '@/modules/application/hooks/useWalletConnected';
import { useEnsName } from '@/modules/ens';
import { useDaoOverrides } from '@/shared/api/cmsService';
import type { IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import {
    type INavigationContainerProps,
    Navigation,
} from '@/shared/components/navigation';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { daoUtils } from '@/shared/utils/daoUtils';
import { daoVisibilityUtils } from '@/shared/utils/daoVisibilityUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { useWalletAccount } from '../../../hooks/useWalletAccount';
import { FooterSidebar } from '../../footer';
import { SupportChatTrigger } from '../../supportChat';
import { NavigationSidebarAccount } from '../navigationSidebarAccount';
import { NavigationDaoHome } from './navigationDaoHome';
import { navigationDaoUtils } from './navigationDaoUtils';

export interface INavigationDaoProps extends INavigationContainerProps {
    /**
     * DAO to display the data for.
     */
    dao: IDao;
    /**
     * Renders the sidebar from the `lg` breakpoint instead of the navigation bar, which then only shows below it.
     * Render the navigation as the `navigation` of `LayoutSidebar` when set.
     */
    withSidebar?: boolean;
}

export const NavigationDao: React.FC<INavigationDaoProps> = (props) => {
    const { dao, withSidebar, className, containerClasses, ...otherProps } =
        props;
    const daoDisplayName = daoUtils.getDaoDisplayName(dao);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Zero width = the bar is collapsed (`hidden lg:flex`). The dialog renders outside the app
    // column and can't use that breakpoint, so it follows the measured links. With the sidebar the bar
    // never shows its links, so it stays collapsed and the dialog and sidebar list every link.
    const linksRef = useRef<HTMLDivElement>(null);
    const [isBarCollapsed, setIsBarCollapsed] = useState(true);

    useEffect(() => {
        const links = linksRef.current;

        if (links == null) {
            return;
        }

        const observer = new ResizeObserver(([entry]) =>
            setIsBarCollapsed(entry.contentRect.width === 0),
        );
        observer.observe(links);

        return () => observer.disconnect();
    }, []);

    const { t } = useTranslations();
    const { address } = useWalletAccount();
    const { data: displayName } = useEnsName(address, {
        stripAragonRegistrySuffix: true,
    });
    const isConnected = useWalletConnected();
    const isMounted = useIsMounted();
    const effectiveIsConnected = isMounted && isConnected && address != null;
    const { open } = useDialogContext();

    const { buildEntityUrl } = useDaoChain({ network: dao.network });
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: dao.address,
    });

    const { data: daoOverrides } = useDaoOverrides();
    const daoOverride = daoOverrides?.[dao.id];
    const visiblePlugins = daoVisibilityUtils.filterHiddenPlugins(
        dao.plugins,
        daoOverride,
    );
    const daoWithVisiblePlugins = { ...dao, plugins: visiblePlugins };
    const pageLinks = navigationDaoUtils.buildLinks(
        daoWithVisiblePlugins,
        'page',
        daoOverride?.navLinksToHide,
    );
    const dialogLinks = navigationDaoUtils.buildDialogLinks(
        daoWithVisiblePlugins,
        isBarCollapsed,
        daoOverride?.navLinksToHide,
    );

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
    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const openDialog = () => setIsDialogOpen(true);

    const daoSummary = (
        <>
            <DaoAvatar
                name={daoDisplayName}
                responsiveSize={{ sm: 'xl' }}
                size="lg"
                src={daoAvatar}
            />
            <div className="flex min-w-0 flex-col gap-nav-tight--fixed-6">
                <Tooltip content={daoDisplayName} triggerAsChild={true}>
                    <p className="truncate type-control--dao-name text-surface-primary sm:type-control--dao-name-wide">
                        {daoDisplayName}
                    </p>
                </Tooltip>
                <AddressOutput
                    address={dao.address}
                    className="w-full type-supporting--sm-step-label text-surface-secondary sm:type-supporting--sm-step-label-wide"
                    copy={false}
                    href={addressLink}
                    isExternal={true}
                />
            </div>
        </>
    );

    return (
        <>
            {withSidebar && (
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
                        <div className="flex flex-col gap-nav-related--fixed-12 px-inset-nav-item pt-inset-nav-item--fixed-8">
                            {daoSummary}
                        </div>
                    }
                    links={dialogLinks}
                />
            )}
            <Navigation.Container
                className={classNames({ 'lg:hidden': withSidebar }, className)}
                containerClasses={classNames(
                    'flex flex-col gap-nav-related py-inset-nav-bar lg:gap-nav-related--fixed-12',
                    containerClasses,
                )}
                // On the sidebar layout the floating launcher (LayoutSidebar) is the chat entry point.
                trailing={withSidebar ? undefined : <SupportChatTrigger />}
                {...otherProps}
            >
                <div className="flex items-center justify-between gap-nav-tight">
                    <NavigationDaoHome dao={dao} onClick={openDialog} />
                    {!withSidebar && (
                        <Navigation.Links
                            className="hidden lg:flex"
                            links={pageLinks}
                            ref={linksRef}
                        />
                    )}
                    <div className="flex items-center gap-x-nav-related lg:gap-x-nav-related--fixed-12">
                        <Wallet onClick={handleWalletClick} user={walletUser} />
                        <Navigation.Trigger
                            className="md:hidden"
                            onClick={openDialog}
                        />
                    </div>
                </div>
                <Navigation.Dialog
                    hiddenDescription={t(
                        'app.application.navigationDao.a11y.description',
                    )}
                    hiddenTitle={t('app.application.navigationDao.a11y.title')}
                    links={dialogLinks}
                    onOpenChange={setIsDialogOpen}
                    open={isDialogOpen}
                >
                    <div className="flex flex-col gap-nav-related--fixed-12 px-inset-nav-bar--fixed-32">
                        {daoSummary}
                    </div>
                </Navigation.Dialog>
            </Navigation.Container>
        </>
    );
};
