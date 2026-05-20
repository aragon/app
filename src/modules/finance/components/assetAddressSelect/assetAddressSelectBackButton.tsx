import { Icon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';

export interface IAssetAddressSelectBackButtonProps
    extends ComponentProps<'button'> {
    /**
     * Label shown to the right of the chevron — typically the destination name.
     */
    children: ReactNode;
}

export const AssetAddressSelectBackButton: React.FC<
    IAssetAddressSelectBackButtonProps
> = (props) => {
    const { className, type = 'button', children, ...otherProps } = props;

    return (
        <button
            className={classNames(
                'group flex w-full items-center gap-3 rounded-xl bg-transparent px-4 py-3 text-base text-neutral-500 leading-tight transition-colors',
                // Default bg transparent; hover/focus use neutral-800 @ 4%, active @ 8%
                'focus-ring-primary hover:bg-neutral-800/4 active:bg-neutral-800/8',
                'md:gap-4 md:px-6 md:py-5 md:text-lg',

                className,
            )}
            type={type}
            {...otherProps}
        >
            <span
                className={classNames(
                    'flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-50 transition-colors md:size-8',
                    'group-hover:bg-neutral-0 group-focus-visible:bg-neutral-0 group-active:bg-neutral-0',
                )}
            >
                <Icon
                    className="size-3 text-neutral-500 md:size-4"
                    icon={IconType.CHEVRON_LEFT}
                />
            </span>
            <span className="flex-1 truncate text-left">{children}</span>
        </button>
    );
};
