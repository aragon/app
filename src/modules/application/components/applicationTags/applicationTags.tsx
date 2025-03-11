import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { Tag, type ITagProps } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import type { ComponentProps } from 'react';

export interface IApplicationTagsProps extends ComponentProps<'div'> {
    /**
     * Variant of the application tags.
     * @default primary
     */
    variant?: ITagProps['variant'];
}

export const ApplicationTags: React.FC<IApplicationTagsProps> = (props) => {
    const { variant = 'primary', className, ...otherProps } = props;

    const version = useApplicationVersion();

    return (
        <div className={classNames('flex flex-row gap-2', className)} {...otherProps}>
            <Tag variant={variant} label={version} />
        </div>
    );
};
