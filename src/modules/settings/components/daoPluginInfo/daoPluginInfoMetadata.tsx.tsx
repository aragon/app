import type { IResource } from '@/shared/api/daoService';
import { IconType, Link } from '@aragon/gov-ui-kit';

export interface IDaoPluginInfoMetadataProps {
    /**
     * The plugin description.
     */
    description?: string;
    /**
     * The links related to the plugin.
     */
    links?: IResource[];
}

export const DaoPluginInfoMetadata: React.FC<IDaoPluginInfoMetadataProps> = (props) => {
    const { description, links } = props;

    return (
        <div className="flex flex-col gap-y-6">
            {description && <p className="text-neutral-500">{description}</p>}
            {links?.map((resource: IResource, index: number) => (
                <div className="flex flex-col gap-y-3" key={index}>
                    <Link
                        description={resource.url}
                        href={resource.url}
                        target="_blank"
                        iconRight={IconType.LINK_EXTERNAL}
                    >
                        {resource.name}
                    </Link>
                </div>
            ))}
        </div>
    );
};
