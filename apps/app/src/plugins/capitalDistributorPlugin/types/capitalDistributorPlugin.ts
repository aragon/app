import type { IDaoPlugin } from '@/shared/api/daoService';

export interface ICapitalDistributorPlugin extends IDaoPlugin {
    /**
     * List of countries from which users are not allowed to claim rewards.
     */
    blockedCountries?: string[];
    /**
     * URL to the terms and conditions that the user must accept before proceeding to the claim flow.
     */
    termsConditionsUrl?: string;
    /**
     * Whether to perform OFAC checks on recipient addresses..
     */
    enableOfacCheck?: boolean;
}
