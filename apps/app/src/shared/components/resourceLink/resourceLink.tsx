import { type ILinkProps, Link } from '@aragon/gov-ui-kit';

export interface IResourceLinkProps
    extends Omit<ILinkProps, 'children' | 'href' | 'showUrl'> {
    /**
     * Optional custom text for the resource link.
     */
    name?: string;
    /**
     * Resource URL.
     */
    url: string;
}

/**
 * Renders an external resource link (gov-ui-kit Link) for user-authored resources: the name is used as link text with
 * the URL shown below it, falling back to the URL alone when no name is set. Not to be confused with the shared Link
 * component, which wraps the Next.js Link for internal navigation.
 */
export const ResourceLink: React.FC<IResourceLinkProps> = (props) => {
    const { name, url, ...otherProps } = props;
    const hasName = Boolean(name);

    return (
        <Link href={url} showUrl={hasName} {...otherProps}>
            {name || url}
        </Link>
    );
};
