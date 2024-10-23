import { AvatarIcon, IconType } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface INavigationTriggerProps extends ComponentProps<'button'> {}

export const NavigationTrigger: React.FC<INavigationTriggerProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <button
            className={classNames(
                'rounded-full border border-neutral-100 bg-neutral-0 p-[3px] outline-none', // Default
                'hover:border-neutral-200 active:border-neutral-200 active:bg-neutral-50', // Hover / Active states
                'focus:outline-none focus-visible:ring focus-visible:ring-primary focus-visible:ring-offset', // Focus state,
                className,
            )}
            {...otherProps}
        >
            <AvatarIcon icon={IconType.MENU} size="lg" />
        </button>
    );
};
