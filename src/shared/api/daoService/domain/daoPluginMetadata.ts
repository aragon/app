import type { IResource } from './resource';

export interface IDaoPluginMetadata {
    /**
     * The name of the plugin.
     */
    name: string;
    /**
     * The key of the plugin.
     */
    key?: string;
    /**
     * Summary of the plugin.
     */
    summary?: string;
    /**
     * Resources of the plugin.
     */
    resources?: IResource[];
}
