import type { SVGProps } from 'react';
import { illustrationObjectList } from './illustrationObjectList';
import type { IllustrationObjectType } from './illustrationObjectType';

export interface IIllustrationObjectProps extends SVGProps<SVGSVGElement> {
    /**
     * Illustration object to render.
     */
    object: IllustrationObjectType;
}

/**
 * Usage notes:
 *
 * - `IllustrationObject` returns the selected SVG directly and does not add a wrapper or default `width: 100%`;
 *   size it through the forwarded SVG props such as `style`, `className` or `width`.
 * - `object` must use the exported `IllustrationObjectType` string-union values, which are compile-time types
 *   rather than runtime enum objects.
 */
export const IllustrationObject: React.FC<IIllustrationObjectProps> = (props) => {
    const { object, ...otherProps } = props;
    const IllustrationObject = illustrationObjectList[object];

    return <IllustrationObject data-testid={object} {...otherProps} />;
};
