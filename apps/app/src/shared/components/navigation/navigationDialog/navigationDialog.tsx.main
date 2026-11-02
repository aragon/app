import { Dialog, IconType, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { type INavigationLink, NavigationLinks } from '../navigationLinks';
import { NavigationLinksItem } from '../navigationLinks/navigationLinksItem';

export interface INavigationDialogProps extends IDialogRootProps {
    /**
     * Links of the application.
     */
    links: INavigationLink[];
}

export const NavigationDialog: React.FC<INavigationDialogProps> = (props) => {
    const { links, children, onOpenChange, ...otherProps } = props;

    const { t } = useTranslations();
    const handleLinksClick = () => onOpenChange?.(false);

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <Dialog.Content
                className="flex flex-col gap-4 pt-8 pb-4"
                noInset={true}
            >
                {children}
                <div className="flex flex-col gap-4 px-4">
                    <NavigationLinks
                        links={links}
                        onClick={handleLinksClick}
                        variant="column"
                    />
                    <div className="w-full px-4">
                        <div className="border-neutral-100 border-t" />
                    </div>
                    <NavigationLinksItem
                        href="/"
                        icon={IconType.APP_EXPLORE}
                        iconSide="right"
                        variant="column"
                    >
                        {t('app.application.navigationDao.dialog.explore')}
                    </NavigationLinksItem>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
