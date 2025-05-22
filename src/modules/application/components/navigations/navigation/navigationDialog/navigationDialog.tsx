import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { daoUtils } from '@/shared/utils/daoUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import {
    addressUtils,
    ChainEntityType,
    Clipboard,
    DaoAvatar,
    Dialog,
    Icon,
    IconType,
    Link,
    useBlockExplorer,
    type IDialogRootProps,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import NextLink from 'next/link';
import { NavigationLinks, type INavigationLink } from '../navigationLinks';

export interface INavigationDialogProps<TRouteType extends string> extends IDialogRootProps {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
    /**
     * DAO where the user is navigating.
     */
    dao: IDao;
}

export const NavigationDialog = <TRouteType extends string>(props: INavigationDialogProps<TRouteType>) => {
    const { links, dao, children, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();

    const daoAvatar = ipfsUtils.cidToSrc(dao.avatar);

    const handleLinksClick = () => onOpenChange?.(false);

    const dialogSubtitle = daoUtils.getDaoEns(dao) ?? addressUtils.truncateAddress(dao.address);

    const { buildEntityUrl } = useBlockExplorer();
    const addressLink = buildEntityUrl({
        type: ChainEntityType.ADDRESS,
        id: dao.address,
        chainId: networkDefinitions[dao.network].id,
    });

    const desktopOnlyLabels = new Set([
        'app.application.navigationDao.link.dashboard',
        'app.application.navigationDao.link.settings',
    ]);

    const desktopLinks = links.filter((link) => desktopOnlyLabels.has(link.label));

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <Dialog.Content className="flex flex-col gap-4 py-7">
                {children}
                <div className="flex flex-col gap-3 px-4">
                    <DaoAvatar src={daoAvatar} name={dao.name} size="lg" responsiveSize={{ sm: 'xl' }} />
                    <div className="flex flex-col gap-1.5 leading-tight font-normal">
                        <p className="truncate text-lg text-neutral-800 sm:text-xl">{dao.name}</p>
                        <Clipboard copyValue={dao.address} className="w-full">
                            <Link
                                href={addressLink}
                                isExternal={true}
                                className="truncate text-sm text-neutral-500 sm:text-base"
                            >
                                {dialogSubtitle}
                            </Link>
                        </Clipboard>
                    </div>
                </div>
                <NavigationLinks
                    variant="column"
                    links={desktopLinks}
                    onClick={handleLinksClick}
                    className="hidden lg:flex lg:flex-col"
                />
                <NavigationLinks
                    variant="column"
                    links={links}
                    onClick={handleLinksClick}
                    className="flex flex-col lg:hidden"
                />
                <div className="w-full px-4">
                    <div className="border-t border-neutral-100" />
                </div>
                <NextLink
                    href="/"
                    className={classNames(
                        'group flex flex-row justify-between truncate rounded-xl px-4 py-3 text-base leading-tight font-normal text-neutral-500',
                        'hover:bg-neutral-50 hover:text-neutral-800 active:text-neutral-800',
                        'focus-ring-primary',
                    )}
                >
                    <p>{t('app.application.navigationDao.dialog.explore')}</p>
                    <Icon
                        icon={IconType.APP_EXPLORE}
                        size="lg"
                        className="text-neutral-300 group-active:text-neutral-500"
                    />
                </NextLink>
            </Dialog.Content>
        </Dialog.Root>
    );
};
