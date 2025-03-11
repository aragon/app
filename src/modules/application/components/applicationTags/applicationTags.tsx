import { useApplicationVersion } from '@/shared/hooks/useApplicationVersion';
import { Tag, type ITagProps } from '@aragon/gov-ui-kit';

export interface IApplicationTagsProps {
    /**
     * Variant of the application tags.
     * @default primary
     */
    variant?: ITagProps['variant'];
}

export const ApplicationTags: React.FC<IApplicationTagsProps> = (props) => {
    const { variant = 'primary' } = props;

    const version = useApplicationVersion();

    return <Tag variant={variant} label={version} />;
};
