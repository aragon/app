import { RadioGroupIndicator, RadioGroupItem } from '@radix-ui/react-radio-group';
import classNames from 'classnames';
import { type ComponentProps, forwardRef, type ReactNode } from 'react';
import { useRandomId } from '../../../hooks';
import { Avatar } from '../../avatars';
import { Icon, IconType } from '../../icon';
import { type ITagProps, Tag } from '../../tag';

export interface IRadioCardProps extends ComponentProps<'button'> {
    /**
     * Radio card avatar image source
     */
    avatar?: string;
    /**
     * Description
     */
    description?: string;
    /**
     * Radio label
     */
    label: string;
    /**
     * Radio card tag
     */
    tag?: ITagProps;
    /**
     * The value of the radio item.
     */
    value: string;
    /**
     * Indicates if the radio is disabled.
     */
    disabled?: boolean;
    /**
     * Additional children to render when the radio is selected.
     */
    children?: ReactNode;
}

/**
 * Usage notes:
 *
 * - Render `RadioCard` inside a `RadioGroup`: it is a Radix radio item that reads its selected state from the group
 *   and carries only a `value`, not a checked prop.
 * - `children` render only while the card is selected, so use them for detail that should appear once the option is
 *   chosen.
 */
export const RadioCard = forwardRef<HTMLButtonElement, IRadioCardProps>((props, ref) => {
    const { value, id, className, tag, avatar, label, description, disabled, children, ...rest } = props;

    const randomId = useRandomId(id);
    const labelId = `${randomId}-label`;

    const containerClasses = classNames(
        'group flex w-full flex-col gap-3 rounded-xl border border-surface-default bg-surface-primary px-4 py-3 focus-ring ring-accent-focus', // default
        'cursor-pointer outline-hidden transition-all shadow-surface-sm md:rounded-2xl md:px-6 md:py-4', // default
        'data-[state=checked]:border-surface-selected data-[state=checked]:shadow-accent-default', // checked
        'hover:border-surface-hover hover:shadow-surface-default hover:data-[state=checked]:shadow-accent-md', // hover
        'disabled:cursor-default disabled:border-surface-disabled disabled:bg-surface-disabled disabled:shadow-none', // disabled
        'disabled:data-[state=checked]:border-neutral-300 disabled:data-[state=checked]:shadow-none', // disabled & checked
        className,
    );

    const labelClasses = classNames(
        'w-full truncate text-left text-surface-default group-disabled:text-surface-disabled md:text-base',
        'group-data-[state=checked]:text-surface-primary group-data-[state=checked]:group-disabled:text-surface-primary',
    );

    return (
        <RadioGroupItem
            aria-labelledby={labelId}
            className={containerClasses}
            disabled={disabled}
            id={randomId}
            ref={ref}
            value={value}
            {...rest}
        >
            <div className="flex size-full items-center gap-x-3 md:gap-x-4">
                {avatar && <Avatar responsiveSize={{ md: 'md' }} size="sm" src={avatar} />}
                <div
                    className={classNames('flex min-w-0 flex-1 gap-x-0.5 md:gap-x-4', { 'items-center': !description })}
                >
                    <div className="flex min-w-0 flex-1 flex-col gap-y-0.5 text-sm leading-tight font-normal md:gap-y-1">
                        <p className={labelClasses} id={labelId}>
                            {label}
                        </p>
                        {description && (
                            <p className="w-full truncate text-left text-surface-secondary group-disabled:text-surface-disabled">
                                {description}
                            </p>
                        )}
                    </div>
                    {tag && <Tag {...tag} />}
                </div>
                <span className={classNames({ 'h-full': description })}>
                    <Icon className="icon-surface-default group-data-[state=checked]:hidden" icon={IconType.RADIO} />
                    <RadioGroupIndicator>
                        <Icon
                            className="icon-accent-selected group-disabled:text-neutral-500"
                            icon={IconType.RADIO_SELECTED}
                        />
                    </RadioGroupIndicator>
                </span>
            </div>
            {children && <div className="hidden group-data-[state=checked]:block">{children}</div>}
        </RadioGroupItem>
    );
});

RadioCard.displayName = 'RadioCard';
