import type { IResource } from '../api/daoService/domain/resource';

export interface IDaoPluginMetadata {
    /**
     * The name of the plugin/process.
     */
    name?: string;
    /**
     * The key of the plugin/process.
     */
    processKey?: string;
    /**
     * Summary of the plugin/process.
     */
    summary?: string;
    /**
     * Resources of the plugin/process.
     */
    resources?: IResource[];
}
