export interface ICapitalDistributorClaimDialogForm {
    /**
     * Receiver of the campaign rewards.
     */
    recipient: string;
    /**
     * Boolean indicating if the user accepted or not the terms and condition (if required by the plugin)
     */
    termsConditionsAccepted?: boolean;
}
