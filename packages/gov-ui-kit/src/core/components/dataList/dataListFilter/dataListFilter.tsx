import classNames from 'classnames';
import { type ChangeEvent, type ComponentProps, useState } from 'react';
import { AvatarIcon } from '../../avatars';
import { Button } from '../../button';
import { useGukCoreContext } from '../../gukCoreProvider';
import { Icon, IconType } from '../../icon';
import { Spinner } from '../../spinner';
import { useDataListContext } from '../dataListContext';
import { DataListFilterSort } from './dataListFilterSort';
import { DataListFilterStatus } from './dataListFilterStatus';

export interface IDataListFilterSortItem {
    /**
     * Value of the sort item.
     */
    value: string;
    /**
     * Label of the sort item.
     */
    label: string;
    /**
     * Sort item type to display the correct icon on the sort button.
     */
    type: 'ASC' | 'DESC';
}

export interface IDataListFilterProps extends Omit<ComponentProps<'div'>, 'onChange'> {
    /**
     * Placeholder of the search bar.
     */
    placeholder?: string;
    /**
     * Current value of the search bar.
     */
    searchValue?: string;
    /**
     * Callback called on search value change.
     */
    onSearchValueChange: (value?: string) => void;
    /**
     * Active sorting of the data list.
     */
    activeSort?: string;
    /**
     * Sort items displayed on the sort dropdown.
     */
    sortItems?: IDataListFilterSortItem[];
    /**
     * Callback called on sort change.
     */
    onSortChange?: (sort: string) => void;
    /**
     * Callback called on filter button click. The filter button is not displayed when the callback is not defined.
     */
    onFilterClick?: () => void;
    /**
     * Callback called on reset filters button click. The reset filters button is not displayed when the callback is not defined.
     */
    onResetFiltersClick?: () => void;
}

export const DataListFilter: React.FC<IDataListFilterProps> = (props) => {
    const {
        onFilterClick,
        searchValue = '',
        onSearchValueChange,
        placeholder,
        className,
        activeSort,
        sortItems,
        onSortChange,
        onResetFiltersClick,
        ...otherProps
    } = props;

    const [isFocused, setIsFocused] = useState(false);

    const { state } = useDataListContext();

    const { copy } = useGukCoreContext();

    const handleInputFocus = () => setIsFocused(true);
    const handleInputBlur = () => setIsFocused(false);

    const handleClear = () => onSearchValueChange(undefined);

    const handleSearchValueChange = (event: ChangeEvent<HTMLInputElement>) => onSearchValueChange(event.target.value);

    const displayClearIcon = searchValue.length > 0;

    return (
        <div className={classNames('flex flex-col gap-related--8-12', className)} {...otherProps}>
            <div
                className={classNames(
                    'flex flex-row items-center rounded-xl border py-control-lg pr-control-md--8-12 pl-inset-item--12-24 transition-all',
                    'border-neutral-100 bg-neutral-0 text-neutral-500 shadow-neutral-sm',
                    'text-base leading-tight font-normal',
                    'hover:border-neutral-200 hover:shadow-neutral',
                    'focus-within:border-primary-400 focus-within:shadow-primary',
                    'focus-within:hover:border-primary-400 focus-within:hover:shadow-primary',
                )}
            >
                {state !== 'loading' && (
                    <AvatarIcon
                        icon={IconType.SEARCH}
                        responsiveSize={{ md: 'md' }}
                        size={'sm'}
                        variant={isFocused ? 'primary' : 'neutral'}
                    />
                )}
                {state === 'loading' && (
                    <Spinner className="m-1" responsiveSize={{ md: 'lg' }} size="md" variant="primary" />
                )}
                <input
                    className={classNames(
                        'size-full search-cancel-hidden truncate bg-transparent pl-control-md caret-neutral-500 outline-hidden',
                        'placeholder:text-base placeholder:leading-tight placeholder:font-normal placeholder:text-neutral-300',
                    )}
                    onBlur={handleInputBlur}
                    onChange={handleSearchValueChange}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    type="search"
                    value={searchValue}
                />
                {displayClearIcon && (
                    <button className="mr-related--8-16 cursor-pointer p-2.5" onClick={handleClear} type="button">
                        <Icon className="text-neutral-300" icon={IconType.CLOSE} size="sm" />
                    </button>
                )}
                <div className="flex flex-row gap-related--8-12">
                    {onFilterClick && (
                        <>
                            <Button
                                className="hidden md:flex"
                                iconLeft={IconType.FILTER}
                                onClick={onFilterClick}
                                size="md"
                                variant="tertiary"
                            >
                                {copy.dataListFilter.filter}
                            </Button>
                            <Button
                                className="md:hidden"
                                iconLeft={IconType.FILTER}
                                onClick={onFilterClick}
                                size="md"
                                variant="tertiary"
                            />
                        </>
                    )}
                    <DataListFilterSort
                        activeSort={activeSort}
                        onSortChange={onSortChange}
                        sortItems={sortItems}
                        triggerClassNames="hidden md:flex"
                        triggerLabel={copy.dataListFilter.sort}
                    />
                    <DataListFilterSort
                        activeSort={activeSort}
                        onSortChange={onSortChange}
                        sortItems={sortItems}
                        triggerClassNames="md:hidden"
                    />
                </div>
            </div>
            <DataListFilterStatus onResetFiltersClick={onResetFiltersClick} />
        </div>
    );
};
