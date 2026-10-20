export enum ProposalActionType {
    TRANSFER = 'Transfer',
    TRANSFER_NATIVE = 'TransferNative',
    METADATA_UPDATE = 'MetadataUpdate',
    METADATA_PLUGIN_UPDATE = 'MetadataPluginUpdate',
    /**
     * App-only type of a plugin settings change after the plugin normalizes it into term/definition lists. Not returned
     * by the backend, which sends each plugin's own settings action type instead.
     */
    CHANGE_SETTINGS = 'CHANGE_SETTINGS',
}
