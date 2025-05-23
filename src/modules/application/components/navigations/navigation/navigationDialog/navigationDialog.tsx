import type { IDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, IconType, type IDialogRootProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { NavigationLinks, type INavigationLink } from '../navigationLinks';
import { NavigationLinksItem } from '../navigationLinks/navigationLinksItem';

export interface INavigationDialogProps<TRouteType extends string> extends IDialogRootProps {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
    /**
     * Filtered links of the application.
     */
    filteredLinks?: Array<INavigationLink<TRouteType>>;
    /**
     * DAO where the user is navigating.
     */
    dao?: IDao;
}

export const NavigationDialog = <TRouteType extends string>(props: INavigationDialogProps<TRouteType>) => {
    const { links, filteredLinks, dao, children, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const handleLinksClick = () => onOpenChange?.(false);

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <Dialog.Content className="flex flex-col gap-4 py-7">
                {children}
                {filteredLinks && (
                    <NavigationLinks
                        variant="column"
                        links={filteredLinks}
                        onClick={handleLinksClick}
                        className="hidden lg:flex lg:flex-col"
                    />
                )}
                <NavigationLinks
                    variant="column"
                    links={links}
                    onClick={handleLinksClick}
                    className={classNames('flex flex-col', { 'lg:hidden': !filteredLinks })}
                />
                <div className="w-full px-4">
                    <div className="border-t border-neutral-100" />
                </div>
                <NavigationLinksItem href="/" variant="column" icon={IconType.APP_EXPLORE} iconSide="right">
                    {t('app.application.navigationDao.dialog.explore')}
                </NavigationLinksItem>
            </Dialog.Content>
        </Dialog.Root>
    );
};
