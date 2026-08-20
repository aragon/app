export interface IWorkspaceGateSelector {
    /**
     * Four-byte selector of the gated function.
     */
    selector: string;
    /**
     * Signature of the gated function.
     */
    signature: string;
}
