import { Dialog, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { ApplicationTags } from '../../../applicationTags';
import { AragonLogo } from '../../../aragonLogo';
import { NavigationLinks, type INavigationLink } from '../navigationLinks';

export interface INavigationDialogProps<TRouteType extends string> extends IDialogRootProps {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
}

export const NavigationDialog = <TRouteType extends string>(props: INavigationDialogProps<TRouteType>) => {
    const { links, children, onOpenChange, ...otherProps } = props;

    const handleLinksClick = () => onOpenChange?.(false);

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <Dialog.Content className="flex flex-col gap-6 py-7">
                {children}
                <NavigationLinks variant="rows" links={links} onClick={handleLinksClick} />
                <div className="flex flex-row items-center justify-between px-4">
                    <AragonLogo iconOnly={true} />
                    <ApplicationTags variant="neutral" />
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
