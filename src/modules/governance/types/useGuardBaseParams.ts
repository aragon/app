export interface IUseGuardBaseParams {
    /**
     * Callback called when the user is capable of participating.
     */
    onSuccess?: () => void;
    /**
     * Callback called when the user cannot participate.
     */
    onError?: () => void;
}
