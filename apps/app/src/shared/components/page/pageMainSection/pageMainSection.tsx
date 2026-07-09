'use client';

import {
    Button,
    Heading,
    type IButtonProps,
    Icon,
    type IconType,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IPageMainSectionActionProps
    extends Omit<IButtonProps, 'variant' | 'size' | 'children'> {
    /**
     * Label of the section action.
     */
    label: string;
}

export interface IPageMainSectionProps extends ComponentProps<'div'> {
    /**
     * Set the default spacing between the title and the section content when set to true.
     * @default true
     */
    inset?: boolean;
    /**
     * Title of the section.
     */
    title: string;
    /**
     * Description of the section.
     */
    description?: string;
    /**
     * An icon to display next to the title.
     */
    icon?: IconType;
    /**
     * Optional action to be displayed beside the section title.
     */
    action?: IPageMainSectionActionProps;
}

export const PageMainSection: React.FC<IPageMainSectionProps> = (props) => {
    const {
        children,
        className,
        inset = true,
        title,
        description,
        icon,
        action,
        ...otherProps
    } = props;

    const { label: actionLabel, ...actionProps } = action ?? {};

    return (
        <div
            className={classNames(
                'flex flex-col',
                { 'gap-4': inset },
                className,
            )}
            {...otherProps}
        >
            <div className="flex flex-col gap-2">
                <div className="flex flex-row justify-between gap-1">
                    <div className="flex items-center gap-2">
                        <Heading size="h2">{title}</Heading>
                        {icon && (
                            <Icon
                                className="text-warning-500"
                                icon={icon}
                                size="md"
                            />
                        )}
                    </div>
                    {action && (
                        <Button
                            size="md"
                            variant="primary"
                            {...(actionProps as IButtonProps)}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </div>
                {description && (
                    <p className="font-normal text-base text-neutral-500 leading-normal">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
};
