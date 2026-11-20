import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export interface ICardProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Usage notes:
 *
 * - `Card` styles only its surface (rounding, neutral background, hairline border, shadow): it adds no padding. Add
 *   spacing through `className` or the content inside. Replace the border colour through `className`; colours
 *   sorting before `neutral` (e.g. `critical`) need the important modifier (`border-critical-200!`).
 */
export const Card: React.FC<ICardProps> = (props) => {
    const { className, ...otherProps } = props;

    return (
        <div
            className={classNames('rounded-xl border border-neutral-100 bg-neutral-0 shadow-neutral', className)}
            {...otherProps}
        />
    );
};
