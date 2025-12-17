import { Link } from '@aragon/gov-ui-kit';
import type { IResource } from '@/shared/api/daoService';

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
            {links?.map((resource: IResource) => (
                <div className="flex flex-col gap-y-3" key={resource.url}>
                    <Link href={resource.url} isExternal={true} showUrl={true}>
                        {resource.name}
                    </Link>
                </div>
            ))}
        </div>
    );
};
