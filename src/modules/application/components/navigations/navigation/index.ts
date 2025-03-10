import { NavigationAppLinks } from './navigationAppLinks';
import { NavigationContainer } from './navigationContainer';
import { NavigationDialog } from './navigationDialog';
import { NavigationLinks } from './navigationLinks';
import { NavigationTrigger } from './navigationTrigger';

export const Navigation = {
    Container: NavigationContainer,
    Links: NavigationLinks,
    Trigger: NavigationTrigger,
    Dialog: NavigationDialog,
    AppLinks: NavigationAppLinks,
};

export * from './navigationAppLinks';
export * from './navigationContainer';
export * from './navigationDialog';
export * from './navigationLinks';
export * from './navigationTrigger';
