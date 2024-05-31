import AragonAppLogo from '@/assets/images/aragon-app.svg';
import { Image } from '@/shared/components/image';
import { Dialog, Tag, type IDialogRootProps } from '@aragon/ods';
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
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center gap-1 px-4">
                        <Image alt="Aragon logo" width={32} height={32} fill={false} src="/icon.svg" />
                        <Image alt="Aragon App logo" className="w-10" fill={false} src={AragonAppLogo} />
                    </div>
                    <div className="flex flex-row gap-2">
                        <Tag variant="neutral" label="Beta" />
                        <Tag variant="neutral" label="v2.4.22" />
                    </div>
                </div>
            </Dialog.Content>
        </Dialog.Root>
    );
};
