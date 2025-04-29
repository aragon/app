import type { ILinkProps } from '@aragon/gov-ui-kit';

export interface IPluginSettings {
    /**
     * Address of the plugin.
     */
    pluginAddress: string;
    /**
     * Name of the plugin.
     */
    pluginName?: string;
    /**
     * Link to the plugin deployment.
     */
    link?: ILinkProps;
}
