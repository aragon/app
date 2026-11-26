import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface INavigationTriggerProps extends ComponentProps<'button'> {}

export const NavigationTrigger: React.FC<INavigationTriggerProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <button
            className={classNames(
                // biome-ignore lint/plugin/noPrimitiveSpacing: frame of the menu trigger
                'rounded-full border border-surface-default bg-surface-default p-[3px] ring-accent-focus focus-ring outline-none', // Default
                'hover:border-surface-hover active:border-surface-active-control active:bg-surface-active-control', // Hover / Active states
                className,
            )}
            {...otherProps}
        >
            <AvatarIcon icon={IconType.MENU} size="lg" />
        </button>
    );
};
