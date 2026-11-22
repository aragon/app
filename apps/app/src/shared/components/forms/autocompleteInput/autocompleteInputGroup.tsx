import classNames from 'classnames';
import type { ComponentProps } from 'react';
import type { IAutocompleteInputGroup } from './autocompleteInput.api';

export interface IAutocompleteInputGroupProps extends ComponentProps<'div'> {
    /**
     * Information about the group header.
     */
    group?: IAutocompleteInputGroup;
}

export const AutocompleteInputGroup: React.FC<IAutocompleteInputGroupProps> = (
    props,
) => {
    const { group, className, children, ...otherProps } = props;

    return (
        <div className={classNames('flex flex-col', className)} {...otherProps}>
            {group && (
                <div className="flex flex-row items-center gap-related px-inset-item-flat--fixed-12 py-inset-item-flat--fixed-8">
                    <p className="shrink-0 type-title-group--compact text-surface-primary">
                        {group.name}
                    </p>
                    <hr className="h-[1px] w-full border-surface-secondary" />
                    <p className="shrink-0 type-supporting--compact-detail text-surface-secondary">
                        {group.info}
                    </p>
                    <hr className="h-[1px] w-5 border-surface-secondary" />
                </div>
            )}
            {children}
        </div>
    );
};
