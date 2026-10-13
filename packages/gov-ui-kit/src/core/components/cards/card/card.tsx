import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export interface ICardProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Usage notes:
 *
 * - `Card` styles only its surface (rounding, neutral background, shadow): it adds no padding and no border. Add
 *   spacing through `className` or the content inside.
 */
export const Card: React.FC<ICardProps> = (props) => {
    const { className, ...otherProps } = props;

    return <div className={classNames('rounded-xl bg-neutral-0 shadow-neutral', className)} {...otherProps} />;
};
