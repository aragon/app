import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export interface ICardProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Usage notes:
 *
 * - `Card` styles only its surface (rounding, neutral background, hairline border, shadow): it adds no padding. Add
 *   spacing through `className` or the content inside. A class that overrides a property `Card` sets (background,
 *   border colour, shadow) needs the important modifier (`border-critical-primary!`): the stylesheet orders classes
 *   by name, not by their order in `className`.
 */
export const Card: React.FC<ICardProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <div
            className={classNames(
                'rounded-xl border border-surface-secondary bg-surface-primary shadow-surface-default',
                className,
            )}
            {...otherProps}
        />
    );
};
