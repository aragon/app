'use client';

import { Button, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import type { IWorkspaceAccountFilterProps } from './workspaceAccountFilter';

export interface IWorkspaceAccountDropdownProps
    extends IWorkspaceAccountFilterProps {}

/**
 * Dropdown counterpart of the `WorkspaceAccountFilter` tabs, for the pages whose account list does not fit on a tab
 * strip.
 */
export const WorkspaceAccountDropdown: React.FC<
    IWorkspaceAccountDropdownProps
> = (props) => {
    const { options, value, onSelect } = props;

    const [isOpen, setIsOpen] = useState(false);

    // A single option is the aggregated one already displayed, so there is nothing to choose between.
    if (options.length <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col items-start">
            <Dropdown.Container
                constrainContentWidth={false}
                customTrigger={
                    <Button
                        className="max-w-full md:max-w-64 [&>div]:min-w-0 [&>div]:truncate"
                        iconRight={
                            isOpen ? IconType.CHEVRON_UP : IconType.CHEVRON_DOWN
                        }
                        size="md"
                        variant="tertiary"
                    >
                        {value?.label}
                    </Button>
                }
                onOpenChange={setIsOpen}
                open={isOpen}
            >
                {options.map((option) => (
                    <Dropdown.Item
                        key={option.id}
                        onSelect={() => onSelect(option)}
                        selected={option.id === value?.id}
                    >
                        {option.label}
                    </Dropdown.Item>
                ))}
            </Dropdown.Container>
        </div>
    );
};
