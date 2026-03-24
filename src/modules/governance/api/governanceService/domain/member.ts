import type { IMemberMetrics } from './memberMetrics';

export interface IMember {
    /**
     * Address of the member.
     */
    address: string;
    /**
     * ENS name linked to the member address.
     * @deprecated Prefer `useEnsName(address)` from `@/modules/ens` for real-time resolution.
     * This field is still returned by the backend but is no longer used for display.
     */
    ens: string | null;
    /**
     * Type of the member.
     */
    type: string;
    /**
     * Metrics of the member.
     */
    metrics: IMemberMetrics;
}
