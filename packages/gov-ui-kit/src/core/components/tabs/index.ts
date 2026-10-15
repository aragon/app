import { TabsContent } from './tabsContent';
import { TabsList } from './tabsList';
import { TabsRoot } from './tabsRoot';
import { TabsTrigger } from './tabsTrigger';

/**
 * Usage notes:
 *
 * - `Tabs.List` returns nothing when it has exactly one direct React child; its guard counts direct children and
 *   does not require them to be `Tabs.Trigger` elements.
 * - `Tabs.Root` always passes `orientation="horizontal"` to the underlying tabs primitive; vertical orientation is
 *   not available through this component.
 */
export const Tabs = {
    Root: TabsRoot,
    List: TabsList,
    Trigger: TabsTrigger,
    Content: TabsContent,
};

export * from './tabsContent';
export * from './tabsList';
export * from './tabsRoot';
export * from './tabsTrigger';
