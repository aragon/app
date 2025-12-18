import type { SlotId } from '@/shared/utils/pluginRegistryUtils';
import type { IPluginSingleComponentProps } from '../pluginSingleComponent';

export interface IFilterComponentPlugin<TMeta extends object = object, TProps extends object = object> {
    /**
     * ID of the plugin.
     */
    id: string;
    /**
     * Unique ID to be used on the Filter component.
     */
    uniqueId: string;
    /**
     * Label of the plugin to be displayed as on the filter list. Defaults to the plugin id when not set.
     */
    label: string;
    /**
     * Metadata of the filter component plugin.
     */
    meta: TMeta;
    /**
     * Additional properties to be forwarded to the plugin component.
     */
    props: TProps;
}

export interface IPluginFilterComponentProps<TMeta extends object = object, TProps extends object = object> {
    /**
     * Id of the slot component to load.
     */
    slotId: SlotId;
    /**
     * Plugin definitions to load the component from.
     */
    plugins?: IFilterComponentPlugin<TMeta, TProps>[];
    /**
     * Current active plugin to be displayed, defaults to the first plugin.
     */
    value?: IFilterComponentPlugin<TMeta, TProps>;
    /**
     * Callback triggered on active plugin change.
     */
    onValueChange?: (value: IFilterComponentPlugin<TMeta, TProps>) => void;
    /**
     * Name of the search parameter to be used on the URL when selecting a tab.
     * @default plugin
     */
    searchParamName?: string;
    /**
     * Fallback component rendered if no components is registered with the specified slot and plugin IDs
     */
    Fallback?: IPluginSingleComponentProps['Fallback'];
    /**
     * Other properties passed to the loaded component.
     */
    [key: string]: unknown;
}
