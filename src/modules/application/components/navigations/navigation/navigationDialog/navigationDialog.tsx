import { AragonLogo } from '@/shared/components/aragonLogo';
import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { Dialog, Tag, type IDialogRootProps } from '@aragon/gov-ui-kit';
import { NavigationLinks, type INavigationLink } from '../navigationLinks';

export interface INavigationDialogProps<TRouteType extends string> extends IDialogRootProps {
    /**
     * Links of the application.
     */
    links: Array<INavigationLink<TRouteType>>;
}

export const NavigationDialog = <TRouteType extends string>(props: INavigationDialogProps<TRouteType>) => {
    const { links, children, onOpenChange, ...otherProps } = props;

    const version = useApplicationVersion();

    const handleLinksClick = () => onOpenChange?.(false);

    return (
        <Dialog.Root onOpenChange={onOpenChange} {...otherProps}>
            <Dialog.Content className="flex flex-col gap-6 py-7">
                {children}
                <NavigationLinks variant="rows" links={links} onClick={handleLinksClick} />
                <div className="flex flex-row items-center justify-between px-4">
                    <AragonLogo iconOnly={true} />
                    <Tag variant="neutral" label={version} />
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
