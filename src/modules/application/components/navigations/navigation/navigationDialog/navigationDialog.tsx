import { IDao } from '@/shared/api/daoService';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { addressUtils, DaoAvatar, Dialog, Icon, IconType, type IDialogRootProps } from '@aragon/gov-ui-kit';
import Link from 'next/link';
import { NavigationLinks, type INavigationLink } from '../navigationLinks';

export interface INavigationDialogProps<TRouteType extends string> extends IDialogRootProps {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
    /**
     * const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);
     */
    dao: IDao;
}

export const NavigationDialog = <TRouteType extends string>(props: INavigationDialogProps<TRouteType>) => {
    const { links, dao, children, onOpenChange, ...otherProps } = props;

    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const handleLinksClick = () => onOpenChange?.(false);

    const dialogSubtitle = daoUtils.getDaoEns(dao) ?? addressUtils.truncateAddress(dao.address);

    const desktopOnlyLabels = new Set([
        'app.application.navigationDao.link.dashboard',
        'app.application.navigationDao.link.settings',
    ]);

    const desktopLinks = links.filter((link) => desktopOnlyLabels.has(link.label));

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <Dialog.Content className="flex flex-col gap-4 py-7">
                {children}
                <div className="flex flex-col gap-4 px-4">
                    <DaoAvatar src={daoAvatar} name={dao.name} size="md" responsiveSize={{ sm: 'lg' }} />
                    <div className="flex flex-col gap-1.5 font-normal leading-tight">
                        <p className="truncate text-lg text-neutral-800 sm:text-xl">{dao.name}</p>
                        <p className="truncate text-sm text-neutral-500 sm:text-base">{dialogSubtitle}</p>
                    </div>
                </div>
                <NavigationLinks
                    variant="column"
                    links={desktopLinks}
                    onClick={handleLinksClick}
                    className="hidden lg:block"
                />
                <NavigationLinks
                    variant="column"
                    links={links}
                    onClick={handleLinksClick}
                    className="block lg:hidden"
                />
                <div className="w-full px-4">
                    <div className="border-t border-neutral-100" />
                </div>
                <Link
                    href="/"
                    className="flex flex-row items-center justify-between rounded-xl px-4 py-3 text-neutral-500 hover:bg-neutral-50"
                >
                    <p>Explore all DAOs</p>
                    <Icon icon={IconType.APP_EXPLORE} size="lg" className="text-neutral-300" />
                </Link>
            </Dialog.Content>
        </Dialog.Root>
    );
};
