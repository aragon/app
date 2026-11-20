import { TabsTrigger as RadixTabsTrigger } from '@radix-ui/react-tabs';
import classNames from 'classnames';
import { type ComponentProps, useContext } from 'react';
import { Icon, type IconType } from '../../icon';
import { TabsContext } from '../tabsRoot/tabsRoot';

export interface ITabsTriggerProps extends ComponentProps<'button'> {
    /**
     * The label of the tab.
     */
    label: string;
    /**
     * Value linking Tabs.Trigger to its corresponding Tabs.Content
     */
    value: string;
    /**
     * The icon to display on the right side of the tab label.
     */
    iconRight?: IconType;
}

export const TabsTrigger: React.FC<ITabsTriggerProps> = (props) => {
    const { label, iconRight, className, value, disabled, ...otherProps } = props;
    const { isUnderlined } = useContext(TabsContext);

    const triggerClassNames = classNames(
        'group line-clamp-1 flex items-center gap-x-4 rounded-t border-surface-selected py-3 text-base leading-tight font-normal', // Base
        'active:data-[state=active]:text-surface-active active:data-[state=active]:shadow-[inset_0_0_0_0,0_1px_0_0] active:data-[state=active]:shadow-border-surface-selected', // Active state
        'focus:outline-hidden', // Focus state
        { 'hover:shadow-[inset_0_0_0_0,0_1px_0_0] hover:shadow-border-surface-hover-tab': isUnderlined && !disabled }, //  Underlined & enabled variant
        'data-[state=active]:text-surface-primary data-[state=active]:shadow-[inset_0_-1px_0_0,0_1px_0_0] data-[state=active]:shadow-border-surface-selected', // Active selection
        { 'cursor-pointer text-link-secondary-default hover:text-link-secondary-hover-nav': !disabled }, // Enabled state
        { 'text-surface-disabled': disabled }, // Disabled state
        className,
    );

    const iconClassNames = classNames(
        'group-data-[state=active]:text-neutral-800', // Base
        { 'icon-surface-disabled-control': disabled }, // Disabled state
        { 'icon-surface-default-tab group-hover:icon-surface-hover-tab': !disabled }, // Enabled state
        { 'group-focus:text-neutral-500 group-active:icon-surface-active-control': !disabled }, // Enabled & Active/Focus states
    );

    return (
        <RadixTabsTrigger className={triggerClassNames} disabled={disabled} value={value} {...otherProps}>
            {label}
            {iconRight && <Icon className={iconClassNames} icon={iconRight} size="sm" />}
        </RadixTabsTrigger>
    );
};
