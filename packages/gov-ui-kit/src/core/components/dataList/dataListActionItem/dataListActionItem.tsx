import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { Icon, type IconType } from '../../icon';

export type DataListActionItemVariant = 'primary' | 'neutral';

export interface IDataListActionItemProps extends ComponentProps<'button'> {
    /**
     * Icon rendered inside the circular avatar on the left.
     */
    icon: IconType;
    /**
     * Visual variant — `primary` for affirmative actions (e.g. add),
     * `neutral` for back/secondary actions.
     */
    variant: DataListActionItemVariant;
    /**
     * Row label rendered next to the avatar.
     */
    label: string;
}

const variantRowClasses: Record<DataListActionItemVariant, string> = {
    primary: 'text-accent-primary hover:bg-accent-transparent-hover active:bg-accent-transparent-active',
    neutral: 'text-surface-secondary hover:bg-surface-transparent-hover active:bg-surface-transparent-active',
};

const variantAvatarClasses: Record<DataListActionItemVariant, string> = {
    primary: 'bg-accent-subtle',
    neutral: 'bg-surface-secondary',
};

const variantIconClasses: Record<DataListActionItemVariant, string> = {
    primary: 'icon-accent-primary',
    neutral: 'icon-surface-primary-item',
};

export const DataListActionItem: React.FC<IDataListActionItemProps> = (props) => {
    const { className, type = 'button', icon, variant, label, ...otherProps } = props;

    return (
        <button
            className={classNames(
                'group flex w-full items-center gap-3 rounded-xl bg-transparent px-4 py-3 text-base leading-tight transition-colors',
                'ring-accent-focus focus-ring md:gap-4 md:px-6 md:py-5 md:text-lg',
                variantRowClasses[variant],
                className,
            )}
            type={type}
            {...otherProps}
        >
            <span
                className={classNames(
                    'flex size-6 shrink-0 items-center justify-center rounded-full transition-colors md:size-8',
                    'group-hover:bg-surface-hover-lift group-focus-visible:bg-surface-hover-lift group-active:bg-surface-active',
                    variantAvatarClasses[variant],
                )}
            >
                <Icon className={classNames('size-3 md:size-4', variantIconClasses[variant])} icon={icon} />
            </span>
            <span className="flex-1 truncate text-left">{label}</span>
        </button>
    );
};
