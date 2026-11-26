import {
    AccordionHeader as RadixAccordionHeader,
    AccordionTrigger as RadixAccordionTrigger,
} from '@radix-ui/react-accordion';
import classNames from 'classnames';
import { forwardRef } from 'react';
import { AvatarIcon } from '../../avatars';
import { Button } from '../../button';
import { IconType } from '../../icon';
import { Tooltip } from '../../tooltip';
import type { IAccordionItemHeaderProps } from './accordionItemHeader.api';

export const AccordionItemHeader = forwardRef<HTMLButtonElement, IAccordionItemHeaderProps>((props, ref) => {
    const { children, className, disabled, removeControl, index, ...otherProps } = props;

    return (
        <RadixAccordionHeader
            className={classNames(
                'group relative flex overflow-hidden data-[state=open]:gradient-surface-primary-to-b',
                'data-[disabled=true]:bg-surface-disabled', // disabled
            )}
        >
            <div
                aria-hidden="true"
                className={classNames(
                    'absolute inset-0 bg-surface-default transition-opacity duration-300',
                    'group-data-[state=closed]:opacity-100 group-data-[state=open]:opacity-0',
                )}
            />
            <RadixAccordionTrigger
                asChild={removeControl != null && index != null}
                className={classNames(
                    'relative flex flex-1 items-baseline justify-between gap-x-group-stepped--16-24 px-inset-item py-control-item outline-hidden',
                    'ring-accent-focus focus-ring group-data-disabled:cursor-default group-data-disabled:bg-surface-disabled',
                    {
                        'cursor-default': removeControl != null,
                        'cursor-pointer': removeControl == null,
                    },
                    className,
                )}
                ref={ref}
                {...otherProps}
            >
                {removeControl != null && index != null ? (
                    <div className="flex flex-1 items-baseline justify-between gap-x-group">
                        {children}
                        <Tooltip content={removeControl.label} triggerAsChild={true}>
                            <Button
                                disabled={removeControl.disabled}
                                iconLeft={IconType.CLOSE}
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.stopPropagation();
                                    removeControl.onClick(index);
                                }}
                                size="sm"
                                variant="tertiary"
                            />
                        </Tooltip>
                    </div>
                ) : (
                    <>
                        {children}
                        <AvatarIcon
                            className="transition-transform group-data-disabled:bg-surface-disabled group-data-disabled:icon-surface-disabled-accordion group-data-[state=open]:rotate-180"
                            icon={IconType.CHEVRON_DOWN}
                        />
                    </>
                )}
            </RadixAccordionTrigger>
        </RadixAccordionHeader>
    );
});

AccordionItemHeader.displayName = 'AccordionItemHeader';
