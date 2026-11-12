import type { ComponentProps } from 'react';
import { NavigationLinks } from './navigationLinks';
import type { INavigationLinkGroup } from './navigationLinks.api';

export interface INavigationLinksGroupProps
    extends Omit<ComponentProps<'div'>, 'children'> {
    /**
     * Group to render.
     */
    group: INavigationLinkGroup;
    /**
     * Callback called on link click.
     */
    onLinkClick?: () => void;
}

/**
 * A labelled column of navigation links. Nothing is rendered when every link of the group is hidden, so a group that
 * depends on a state (e.g. a connected wallet) disappears with its label.
 */
export const NavigationLinksGroup: React.FC<INavigationLinksGroupProps> = (
    props,
) => {
    const { group, onLinkClick, ...otherProps } = props;
    const { label, links } = group;

    if (links.every((link) => link.hidden)) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1" {...otherProps}>
            {label != null && (
                <p className="truncate px-4 py-1 text-neutral-500 text-sm leading-tight">
                    {label}
                </p>
            )}
            <NavigationLinks
                links={links}
                onClick={onLinkClick}
                variant="column"
            />
        </div>
    );
};
