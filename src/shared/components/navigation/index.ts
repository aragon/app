import { NavigationContainer } from './navigationContainer';
import { NavigationDialog } from './navigationDialog';
import { NavigationLinks, NavigationLinksItem } from './navigationLinks';
import { NavigationTrigger } from './navigationTrigger';

export const Navigation = {
    Container: NavigationContainer,
    Links: NavigationLinks,
    Item: NavigationLinksItem,
    Trigger: NavigationTrigger,
    Dialog: NavigationDialog,
};

export * from './navigationContainer';
export * from './navigationDialog';
export * from './navigationLinks';
export * from './navigationTrigger';
