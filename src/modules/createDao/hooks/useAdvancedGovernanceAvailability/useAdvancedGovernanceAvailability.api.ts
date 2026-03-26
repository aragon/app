export interface IUseAdvancedGovernanceAvailabilityParams {
    /**
     * ID of the DAO to check advanced governance availability for.
     */
    daoId: string;
}

export interface IUseAdvancedGovernanceAvailabilityReturn {
    /**
     * Whether advanced governance is available for this DAO.
     */
    isAvailable: boolean;
    /**
     * Whether the availability check is still loading.
     */
    isLoading: boolean;
}
