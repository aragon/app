import classNames from 'classnames';
import type { ComponentProps, ReactNode } from 'react';
import type { INavigationLink, INavigationLinkGroup } from '../navigationLinks';
import { NavigationLinks, NavigationLinksGroup } from '../navigationLinks';

export interface INavigationSidebarProps extends ComponentProps<'nav'> {
    /**
     * Labelled groups of links, rendered first (e.g. the inbox of the wallet, then the sections of the workspace).
     */
    groups?: INavigationLinkGroup[];
    /**
     * Links of the sidebar, rendered as a column.
     */
    links?: INavigationLink[];
    /**
     * Links rendered below the main ones, apart behind a divider (e.g. the settings of the workspace, below the
     * sections of the account it is scoped to).
     */
    secondaryLinks?: INavigationLink[];
    /**
     * Content above the links (e.g. the DAO or workspace selector).
     */
    header?: ReactNode;
    /**
     * Content pinned to the bottom of the sidebar (e.g. the wallet and the footer).
     */
    footer?: ReactNode;
}

/**
 * Side navigation of the application from the `lg` breakpoint, hidden below it where the navigation bar and its
 * dialog take over. Render it beside the page content through `LayoutSidebar`.
 */
export const NavigationSidebar: React.FC<INavigationSidebarProps> = (props) => {
    const {
        groups,
        links,
        secondaryLinks,
        header,
        footer,
        className,
        ...otherProps
    } = props;

    return (
        <nav
            className={classNames(
                'sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 self-start overflow-y-auto border-neutral-100 border-r bg-neutral-0 px-3 py-4 shadow-[8px_0_24px_-16px_rgba(50,63,75,0.18)] lg:flex',
                className,
            )}
            {...otherProps}
        >
            {header != null && (
                <div className="flex flex-col gap-2">{header}</div>
            )}
            <div className="flex flex-col gap-4">
                {groups?.map((group) => (
                    <NavigationLinksGroup group={group} key={group.id} />
                ))}
                {links != null && (
                    <NavigationLinks links={links} variant="column" />
                )}
                {secondaryLinks != null && (
                    <>
                        <div className="w-full px-4">
                            <div className="border-neutral-100 border-t" />
                        </div>
                        <NavigationLinks
                            links={secondaryLinks}
                            variant="column"
                        />
                    </>
                )}
            </div>
            {footer != null && (
                <div className="mt-auto flex flex-col gap-4">{footer}</div>
            )}
        </nav>
    );
};
