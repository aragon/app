/**
 * Browser registry the workspaces are read from: the persistent one, or the tab-scoped one holding the demo
 * workspaces.
 */
export enum WorkspaceRegistryScope {
    PERSISTENT = 'PERSISTENT',
    DEMO = 'DEMO',
}
