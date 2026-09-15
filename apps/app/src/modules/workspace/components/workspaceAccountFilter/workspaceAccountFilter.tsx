'use client';

import { Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import type { IWorkspaceAccountFilterOption } from '../../hooks/useWorkspaceAccountFilter';

export interface IWorkspaceAccountFilterProps {
    /**
     * Options to display, the aggregated one first.
     */
    options: IWorkspaceAccountFilterOption[];
    /**
     * Currently selected option.
     */
    value?: IWorkspaceAccountFilterOption;
    /**
     * Callback called with the option selected by the user.
     */
    onSelect: (option: IWorkspaceAccountFilterOption) => void;
}

/**
 * Tab strip of the workspace pages: one tab per account plus the aggregated one.
 */
export const WorkspaceAccountFilter: React.FC<IWorkspaceAccountFilterProps> = (
    props,
) => {
    const { options, value, onSelect } = props;

    const handleChange = (optionId?: string) => {
        const option = options.find((current) => current.id === optionId);

        if (option != null) {
            onSelect(option);
        }
    };

    return (
        <ToggleGroup
            isMultiSelect={false}
            onChange={handleChange}
            value={value?.id}
        >
            {options.map((option) => (
                <Toggle
                    key={option.id}
                    label={option.label}
                    value={option.id}
                />
            ))}
        </ToggleGroup>
    );
};
