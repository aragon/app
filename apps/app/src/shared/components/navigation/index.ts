import { NavigationContainer } from './navigationContainer';
import { NavigationDialog } from './navigationDialog';
import { NavigationLinks, NavigationLinksItem } from './navigationLinks';
import { NavigationSidebar } from './navigationSidebar';
import { NavigationTrigger } from './navigationTrigger';

export const Navigation = {
    Container: NavigationContainer,
    Links: NavigationLinks,
    Item: NavigationLinksItem,
    Trigger: NavigationTrigger,
    Dialog: NavigationDialog,
    Sidebar: NavigationSidebar,
};

export * from './navigationContainer';
export * from './navigationDialog';
export * from './navigationLinks';
export * from './navigationSidebar';
export * from './navigationTrigger';
