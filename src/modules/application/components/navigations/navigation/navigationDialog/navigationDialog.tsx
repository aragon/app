import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, IconType, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { NavigationLinks, type INavigationLink } from '../navigationLinks';
import { NavigationLinksItem } from '../navigationLinks/navigationLinksItem';

export interface INavigationDialogProps<TRouteType extends string> extends IDialogRootProps {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
}

export const NavigationDialog = <TRouteType extends string>(props: INavigationDialogProps<TRouteType>) => {
    const { links, children, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const handleLinksClick = () => onOpenChange?.(false);

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <Dialog.Content className="flex flex-col gap-4 py-7">
                {children}
                <NavigationLinks variant="column" links={links} onClick={handleLinksClick} />
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
