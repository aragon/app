import type { ReactNode } from 'react';
import { SupportChatLauncher } from '../../supportChat';

export interface ILayoutSidebarProps {
    /**
     * Navigation of the page: a `Navigation.Sidebar` shown from `lg` plus the navigation bar shown below it. Null lays
     * the page out alone, with the page footer, keeping the children where they are (e.g. a workspace that failed to
     * load, whose gate must not remount).
     */
    navigation: ReactNode;
    /**
     * Content of the page.
     */
    children?: ReactNode;
}

/**
 * Lays the page out beside the side navigation from the `lg` breakpoint and below the navigation bar under it.
 *
 * The navigation stays outside the content column, so its `lg:` switch measures the whole app column like the rest of
 * the layout does. The content column declares its own `app` container: the breakpoint variants measure the nearest
 * one (see breakpoints.css), so the page lays out against the width left beside the sidebar, the same way it does
 * beside the support chat panel.
 *
 * `data-app-sidebar` is read by `LayoutRoot`, which moves the footer into the sidebar while it is shown, so it is only
 * set while there is a navigation. The floating
 * support chat launcher closes the page column, pinned to the bottom of the window.
 */
export const LayoutSidebar: React.FC<ILayoutSidebarProps> = (props) => {
    const { navigation, children } = props;

    return (
        <div
            className="flex grow flex-col lg:flex-row"
            data-app-sidebar={navigation != null ? true : undefined}
        >
            {navigation}
            <div className="@container/app flex min-w-0 grow flex-col">
                {children}
                <SupportChatLauncher />
            </div>
        </div>
    );
};
