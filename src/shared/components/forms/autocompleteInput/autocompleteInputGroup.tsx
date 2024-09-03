import classNames from 'classnames';
import type { ComponentProps } from 'react';
import { type IAutocompleteInputGroup } from './autocompleteInput.api';

export interface IAutocompleteInputGroupProps extends ComponentProps<'div'> {
    /**
     * Information about the group header.
     */
    group?: IAutocompleteInputGroup;
}

export const AutocompleteInputGroup: React.FC<IAutocompleteInputGroupProps> = (props) => {
    const { group, className, children, ...otherProps } = props;

    return (
        <div className={classNames('flex flex-col', className)} {...otherProps}>
            {group && (
                <div className="flex flex-row items-center gap-3 px-3 py-2 text-base font-normal leading-tight">
                    <p className="shrink-0 text-neutral-800">{group.name}</p>
                    <hr className="h-[1px] w-full text-neutral-100" />
                    <p className="text-neutral-500">{group.info}</p>
                </div>
            )}
            {children}
        </div>
    );
};
