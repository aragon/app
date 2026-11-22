import classNames from 'classnames';
import { forwardRef } from 'react';
import { type TypographyStyle, typographyClassNames } from '../../types/typographyStyles';

export type HeadingSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

export interface IHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /**
     * Semantic level of the heading. Without `as`, it is the rendered HTML element; without `typeRole`, it also picks
     * the typography role (h1 title-page, h2 title-section, h3 title-group, h4 title-item, h5 supporting).
     * @deprecated as a way to style the heading: set the element with `as` and the typography with `typeRole`.
     * @default h1
     */
    size?: HeadingSize;
    /**
     * Overrides the HTML element type that is rendered in the DOM, independent of the typography.
     */
    as?: HeadingSize;
    /**
     * Typography role (or documented exception) of the heading, rendered by its `type-<role>` utility. Defaults to the
     * role of `size`.
     */
    typeRole?: TypographyStyle;
}

const headingSizeToTypeRole: Record<HeadingSize, TypographyStyle> = {
    h1: 'title-page',
    h2: 'title-section',
    h3: 'title-group',
    h4: 'title-item',
    h5: 'supporting',
};

export const Heading = forwardRef<HTMLHeadingElement, IHeadingProps>((props, ref) => {
    const { size = 'h1', as, typeRole, className, ...otherProps } = props;
    const Tag = as ?? size;
    const headingClassName = classNames(
        typographyClassNames[typeRole ?? headingSizeToTypeRole[size]],
        'text-surface-primary',
        className,
    );

    return <Tag className={headingClassName} ref={ref} {...otherProps} />;
});

Heading.displayName = 'Heading';
