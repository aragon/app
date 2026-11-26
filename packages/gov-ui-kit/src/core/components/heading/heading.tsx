import classNames from 'classnames';
import { forwardRef } from 'react';

export type HeadingSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export interface IHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /**
     * Specifies the semantic level of the heading, affecting both the HTML element used (e.g., <h1>, <h2>) and its
     * default typography role (h1 title-page, h2 title-section, h3 title-group, h4 title-item, h5 supporting).
     * If the 'as' prop is not provided, this value determines the HTML element rendered in the DOM.
     * @default h1
     */
    size?: HeadingSize;
    /**
     * Optionally overrides the HTML element type that is rendered in the DOM, independent of the heading's semantic level determined by the 'size' prop.
     * This allows for styling and semantic adjustments where necessary.
     */
    as?: HeadingSize;
    /**
     * Typography role class that replaces the default role of `size`, e.g. `type-title-group`.
     */
    typeClassName?: string;
}

const headingToTypeClassNames: Record<HeadingSize, string> = {
    h1: 'type-title-page',
    h2: 'type-title-section',
    h3: 'type-title-group',
    h4: 'type-title-item',
    h5: 'type-supporting',
};

export const Heading = forwardRef<HTMLHeadingElement, IHeadingProps>((props, ref) => {
    const { size = 'h1', as, typeClassName, className, ...otherProps } = props;
    const Tag = as ?? size;
    const headingClassName = classNames(
        typeClassName ?? headingToTypeClassNames[size],
        'text-surface-primary',
        className,
    );

    return <Tag className={headingClassName} ref={ref} {...otherProps} />;
});

Heading.displayName = 'Heading';
