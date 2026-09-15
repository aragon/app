'use client';

import { IconType } from '@aragon/gov-ui-kit';
import { Navigation } from '@/shared/components/navigation';
import type { IWorkspaceAccountLink } from './navigationWorkspaceUtils';

export interface INavigationWorkspaceAccountsProps {
    /**
     * Accounts of the workspace to link to.
     */
    links: IWorkspaceAccountLink[];
    /**
     * Callback called when a link is clicked, used to close the navigation dialog.
     */
    onLinkClick?: () => void;
}

/**
 * Links to the accounts of a workspace, displayed on the navigation dialog below the workspace itself and
 * separated from it by a rule.
 *
 * The items are rendered directly rather than through `Navigation.Links`, which translates its labels: these
 * labels are account names, and a name matching a translation key would be replaced by it.
 */
export const NavigationWorkspaceAccounts: React.FC<
    INavigationWorkspaceAccountsProps
> = (props) => {
    const { links, onLinkClick } = props;

    if (links.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 px-4">
            <div className="w-full px-4">
                <div className="border-neutral-100 border-t" />
            </div>
            <div className="flex flex-col gap-1">
                {links.map((link) => (
                    <Navigation.Item
                        href={link.url}
                        icon={IconType.LINK_EXTERNAL}
                        iconSide="right"
                        key={link.id}
                        onClick={onLinkClick}
                        target="_blank"
                        variant="column"
                    >
                        {link.label}
                    </Navigation.Item>
                ))}
            </div>
        </div>
    );
};
