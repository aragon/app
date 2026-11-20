import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface INavigationTriggerProps extends ComponentProps<'button'> {}

export const NavigationTrigger: React.FC<INavigationTriggerProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <button
            className={classNames(
                'rounded-full border border-surface-default bg-surface-default p-[3px] focus-ring outline-none ring-accent-focus', // Default
                'hover:border-surface-hover active:border-neutral-200 active:bg-neutral-50', // Hover / Active states
                className,
            )}
            {...otherProps}
        >
            <AvatarIcon icon={IconType.MENU} size="lg" />
        </button>
    );
};
