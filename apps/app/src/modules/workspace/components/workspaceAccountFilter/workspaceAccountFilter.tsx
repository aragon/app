'use client';

import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';
import type { IWorkspaceFilterOption } from '@/modules/workspace/hooks/useWorkspaceFilterUrlParam';

export interface IWorkspaceAccountFilterProps
    extends Omit<ComponentProps<'div'>, 'onSelect'> {
    /**
     * Available account filter options.
     */
    options: IWorkspaceFilterOption[];
    /**
     * Currently selected option.
     */
    value: IWorkspaceFilterOption;
    /**
     * Callback called when another option is selected.
     */
    onSelect: (option: IWorkspaceFilterOption) => void;
}

/**
 * Account filter of the workspace pages: the workspace-wide aggregate, one entry per workspace account and, for
 * accounts whose DAO has linked accounts, one entry per linked account.
 */
export const WorkspaceAccountFilter: React.FC<IWorkspaceAccountFilterProps> = (
    props,
) => {
    const { options, value, onSelect, className, ...otherProps } = props;

    // A single option carries no information, the list already shows exactly that account.
    if (options.length < 2) {
        return null;
    }

    const handleChange = (selected?: string | string[]) => {
        const option = options.find((candidate) => candidate.id === selected);

        if (option != null && option.id !== value.id) {
            onSelect(option);
        }
    };

    return (
        <div className={classNames(className)} {...otherProps}>
            <ToggleGroup
                isMultiSelect={false}
                onChange={handleChange}
                value={value.id}
            >
                {options.map((option) => (
                    <Toggle
                        key={option.id}
                        // Linked accounts are marked so they read as belonging to the account listed above them.
                        label={
                            option.isChild ? `↳ ${option.label}` : option.label
                        }
                        value={option.id}
                    />
                ))}
            </ToggleGroup>
        </div>
    );
};
