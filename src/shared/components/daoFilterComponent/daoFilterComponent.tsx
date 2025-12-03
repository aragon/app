'use client';

import type { IFilterComponentPlugin } from '@/shared/components/pluginFilterComponent';
import { PluginFilterComponent } from '@/shared/components/pluginFilterComponent';
import type { IPluginSingleComponentProps } from '@/shared/components/pluginSingleComponent';
import type { IDaoFilterOption } from '@/shared/hooks/useDaoFilterUrlParam';
import type { SlotId } from '@/shared/utils/pluginRegistryUtils';
import type { ReactNode } from 'react';

export interface IDaoFilterComponentProps<TParams extends { queryParams: Record<string, unknown> } = any> {
    /**
     * Slot ID for plugin-based rendering.
     */
    slotId: SlotId;
    /**
     * Available DAO filter options.
     */
    options?: IDaoFilterOption[];
    /**
     * Currently selected DAO option.
     */
    value?: IDaoFilterOption;
    /**
     * Callback when DAO selection changes.
     */
    onValueChange?: (option: IDaoFilterOption) => void;
    /**
     * URL parameter name for the filter.
     */
    searchParamName?: string;
    /**
     * Initial query parameters for building option-specific queries.
     */
    initialParams: TParams;
    /**
     * Translation function for the "All" option label.
     */
    allOptionLabel: string;
    /**
     * Fallback component when no slot component is found.
     */
    Fallback?: IPluginSingleComponentProps['Fallback'];
    /**
     * Hide pagination.
     */
    hidePagination?: boolean;
    /**
     * Children to render.
     */
    children?: ReactNode;
}

/**
 * Maps DAO filter options to the format expected by PluginFilterComponent.
 */
export const mapDaoOptionsToFilterFormat = <TParams extends { queryParams: Record<string, unknown> }>(params: {
    options?: IDaoFilterOption[];
    initialParams: TParams;
    allOptionLabel: string;
}): Array<IFilterComponentPlugin<IDaoFilterOption>> | undefined => {
    const { options, initialParams, allOptionLabel } = params;

    return options?.map((option) => {
        const label = option.isAll ? allOptionLabel : option.label;
        const queryParams = {
            ...initialParams.queryParams,
            daoId: option.daoId,
            address: undefined,
            onlyParent: option.onlyParent,
        };

        return {
            id: option.id,
            uniqueId: option.id,
            label,
            meta: option,
            props: { initialParams: { ...initialParams, queryParams }, daoOption: option },
        };
    });
};

/**
 * DAO-based filter component for assets/transactions/etc.
 * Wraps PluginFilterComponent with DAO-specific API.
 */
export const DaoFilterComponent = <TParams extends { queryParams: Record<string, unknown> } = any>(
    props: IDaoFilterComponentProps<TParams>,
) => {
    const { options, value, onValueChange, initialParams, allOptionLabel, ...otherProps } = props;

    const processedOptions = mapDaoOptionsToFilterFormat({ options, initialParams, allOptionLabel });

    const resolvedValue = processedOptions?.find((opt) => opt.uniqueId === value?.id) ?? processedOptions?.[0];

    const handleValueChange = (filterOption: IFilterComponentPlugin<IDaoFilterOption>) => {
        onValueChange?.(filterOption.meta);
    };

    return (
        <PluginFilterComponent
            plugins={processedOptions}
            value={resolvedValue}
            onValueChange={handleValueChange}
            {...otherProps}
        />
    );
};
