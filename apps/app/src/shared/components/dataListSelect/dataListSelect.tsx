'use client';

import {
    addressUtils,
    DataListActionItem,
    DataListContainer,
    DataListFilter,
    DataListPagination,
    DataListRoot,
    IconType,
    type IDataListContainerProps,
    type IDataListRootProps,
} from '@aragon/gov-ui-kit';
import { Fragment, type ReactNode, useEffect, useState } from 'react';

export interface IDataListSelectLabels {
    /**
     * Name of the listed entities, e.g. "Assets".
     */
    entity: string;
    /**
     * Placeholder of the search input.
     */
    searchPlaceholder: string;
    /**
     * Label of the action opening the address view.
     */
    addAddress: string;
    /**
     * Label of the empty-state button opening the address view.
     */
    addByAddress: string;
    /**
     * Heading of the empty state, given the current search.
     */
    emptyHeading: (search: string) => string;
    /**
     * Description of the empty state.
     */
    emptyDescription: string;
}

export interface IDataListSelectAddressViewParams {
    /**
     * Address searched in the list that no item matched, to look up straight away.
     */
    initialAddress?: string;
    /**
     * Returns to the list.
     */
    onBack: () => void;
}

export interface IDataListSelectProps<TItem>
    extends Pick<
            IDataListRootProps,
            'state' | 'itemsCount' | 'pageSize' | 'onLoadMore'
        >,
        Pick<IDataListContainerProps, 'errorState' | 'SkeletonElement'> {
    /**
     * Items to choose from.
     */
    items: TItem[];
    /**
     * Unique key of an item.
     */
    getItemKey: (item: TItem) => string;
    /**
     * Whether an item matches the search.
     */
    filterItem: (item: TItem, search: string) => boolean;
    /**
     * Renders a selectable item.
     */
    renderItem: (item: TItem) => ReactNode;
    /**
     * Renders the view looking up an address that is not in the list.
     */
    renderAddressView: (params: IDataListSelectAddressViewParams) => ReactNode;
    /**
     * Labels of the select.
     */
    labels: IDataListSelectLabels;
    /**
     * Whether a search should be looked up by address when no item matches it.
     * @default addressUtils.isAddress
     */
    isAddressSearch?: (value: string) => boolean;
    /**
     * Displays the search input.
     */
    hasSearch?: boolean;
    /**
     * Hides the pagination.
     */
    hidePagination?: boolean;
    /**
     * Rendered below the list.
     */
    children?: ReactNode;
}

type DataListSelectMode = 'list' | 'address';

/**
 * Searchable list of items with an address view for what the list does not hold: an address searched without a
 * match opens the view straight away, and the "Add address" action opens it empty.
 */
export const DataListSelect = <TItem,>(props: IDataListSelectProps<TItem>) => {
    const {
        items,
        getItemKey,
        filterItem,
        renderItem,
        renderAddressView,
        labels,
        isAddressSearch = addressUtils.isAddress,
        hasSearch,
        hidePagination,
        children,
        state,
        itemsCount,
        pageSize,
        onLoadMore,
        errorState,
        SkeletonElement,
    } = props;

    const [searchValue, setSearchValue] = useState<string>();
    const [mode, setMode] = useState<DataListSelectMode>('list');
    const [pendingAddress, setPendingAddress] = useState<string>();

    const rows = items.map((item) => ({
        item,
        key: getItemKey(item),
        element: renderItem(item),
    }));

    const filteredRows =
        hasSearch && searchValue
            ? rows.filter(({ item }) => filterItem(item, searchValue))
            : rows;

    useEffect(() => {
        const shouldLookUp =
            mode === 'list' &&
            searchValue != null &&
            isAddressSearch(searchValue) &&
            filteredRows.length === 0;

        if (!shouldLookUp) {
            return;
        }

        setPendingAddress(searchValue);
        setSearchValue(undefined);
        setMode('address');
    }, [mode, searchValue, isAddressSearch, filteredRows.length]);

    const handleOpenAddress = () => setMode('address');
    const handleBack = () => {
        setPendingAddress(undefined);
        setMode('list');
    };

    if (mode === 'address') {
        return renderAddressView({
            initialAddress: pendingAddress,
            onBack: handleBack,
        });
    }

    const emptyState = {
        heading: labels.emptyHeading(searchValue ?? ''),
        description: labels.emptyDescription,
        primaryButton: {
            label: labels.addByAddress,
            iconLeft: IconType.PLUS,
            onClick: handleOpenAddress,
        },
    };

    return (
        <DataListRoot
            entityLabel={labels.entity}
            itemsCount={itemsCount}
            onLoadMore={onLoadMore}
            pageSize={pageSize}
            state={state}
        >
            {hasSearch && (
                <DataListFilter
                    onSearchValueChange={setSearchValue}
                    placeholder={labels.searchPlaceholder}
                    searchValue={searchValue}
                />
            )}
            {filteredRows.length > 0 && (
                <DataListActionItem
                    icon={IconType.PLUS}
                    label={labels.addAddress}
                    onClick={handleOpenAddress}
                    variant="primary"
                />
            )}
            <DataListContainer
                emptyState={emptyState}
                errorState={errorState}
                SkeletonElement={SkeletonElement}
            >
                {filteredRows.map(({ key, element }) => (
                    <Fragment key={key}>{element}</Fragment>
                ))}
            </DataListContainer>
            {!(hidePagination || searchValue) && <DataListPagination />}
            {children}
        </DataListRoot>
    );
};
