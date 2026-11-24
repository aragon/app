'use client';

import {
    DataListActionItem,
    DataListFilter,
    DataListRoot,
    IconType,
} from '@aragon/gov-ui-kit';
import type { ReactNode } from 'react';

export interface IDataListSelectAddressViewProps {
    /**
     * Name of the listed entities.
     */
    entity: string;
    /**
     * Placeholder of the address input.
     */
    placeholder: string;
    /**
     * Label of the action returning to the list.
     */
    backLabel: string;
    /**
     * Current value of the address input.
     */
    searchValue?: string;
    /**
     * Callback called when the address input changes.
     */
    onSearchValueChange: (value?: string) => void;
    /**
     * Returns to the list.
     */
    onBack: () => void;
    /**
     * Whether the lookup is running.
     */
    isLoading?: boolean;
    /**
     * Results of the lookup.
     */
    children?: ReactNode;
}

/**
 * Frame of a `DataListSelect` address view: the address input and the way back to the list, around the results.
 */
export const DataListSelectAddressView: React.FC<
    IDataListSelectAddressViewProps
> = (props) => {
    const {
        entity,
        placeholder,
        backLabel,
        searchValue,
        onSearchValueChange,
        onBack,
        isLoading,
        children,
    } = props;

    return (
        <DataListRoot
            className="flex w-full flex-col gap-3"
            entityLabel={entity}
            state={isLoading ? 'loading' : 'idle'}
        >
            <DataListFilter
                onSearchValueChange={onSearchValueChange}
                placeholder={placeholder}
                searchValue={searchValue}
            />
            <DataListActionItem
                icon={IconType.CHEVRON_LEFT}
                label={backLabel}
                onClick={onBack}
                variant="neutral"
            />
            {children}
        </DataListRoot>
    );
};
