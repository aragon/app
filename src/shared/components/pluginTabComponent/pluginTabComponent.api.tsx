import type { SlotId } from '@/shared/utils/pluginRegistryUtils';

export interface ITabComponentPlugin<TMeta extends object = object, TProps extends object = object> {
    /**
     * ID of the plugin.
     */
    id: string;
    /**
     * Unique ID to be used on the Tab component.
     */
    uniqueId: string;
    /**
     * Label of the plugin to be displayed as on the tab list. Defaults to the plugin id when not set.
     */
    label?: string;
    /**
     * Metadata of the tab component plugin.
     */
    meta: TMeta;
    /**
     * Additional properties to be forwarded to the plugin component.
     */
    props: TProps;
}

export interface IPluginTabComponentProps<TMeta extends object = object, TProps extends object = object> {
    /**
     * Id of the slot component to load.
     */
    slotId: SlotId;
    /**
     * Plugin definitions to load the component from.
     */
    plugins?: Array<ITabComponentPlugin<TMeta, TProps>>;
    /**
     * Current active plugin to be displayed, defaults to the first plugin.
     */
    value?: ITabComponentPlugin<TMeta, TProps>;
    /**
     * Callback triggered on active plugin change.
     */
    onValueChange?: (value: ITabComponentPlugin<TMeta, TProps>) => void;
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}
