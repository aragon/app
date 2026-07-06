import type { IResource } from '@/shared/api/daoService';
import { ResourceLink } from '@/shared/components/resourceLink';

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

export const DaoPluginInfoMetadata: React.FC<IDaoPluginInfoMetadataProps> = (
    props,
) => {
    const { description, links } = props;

    return (
        <div className="flex flex-col gap-y-6">
            {description && <p className="text-neutral-500">{description}</p>}
            {links?.map((resource: IResource) => (
                <div className="flex flex-col gap-y-3" key={resource.url}>
                    <ResourceLink
                        isExternal={true}
                        name={resource.name}
                        url={resource.url}
                    />
                </div>
            ))}
        </div>
    );
};
