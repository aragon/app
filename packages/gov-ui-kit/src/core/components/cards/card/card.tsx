import classNames from 'classnames';
import type { HTMLAttributes } from 'react';

export type CardInset = 'none' | 'surface' | 'surface-flat' | 'surface-wide';

export interface ICardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Padding of the card, as a spacing role: `surface` (16 px, 24 px from md), `surface-flat` (16 × 12 px at every
     * width), `surface-wide` (24 px at every width), or `none` for a card whose content pads itself.
     * @default none
     */
    inset?: CardInset;
}

// Spelled out so that Tailwind finds every class in the source.
const insetClassNames: Record<CardInset, string | undefined> = {
    none: undefined,
    surface: 'p-inset-surface',
    'surface-flat': 'px-inset-surface-flat py-inset-surface-flat',
    'surface-wide': 'p-inset-surface-wide',
};

/**
 * Usage notes:
 *
 * - `Card` styles its surface (rounding, neutral background, hairline border, shadow) and, through `inset`, its padding
 *   as a spacing role; the default `none` adds no padding (the content pads itself). Prefer `inset` to padding classes
 *   in `className`. Replace the border colour through `className`; colours
 *   sorting before `neutral` (e.g. `critical`) need the important modifier (`border-critical-200!`).
 */
export const Card: React.FC<ICardProps> = (props) => {
    const { className, inset = 'none', ...otherProps } = props;

    return (
        <div
            className={classNames(
                'rounded-xl border border-neutral-100 bg-neutral-0 shadow-neutral',
                insetClassNames[inset],
                className,
            )}
            {...otherProps}
        />
    );
};
