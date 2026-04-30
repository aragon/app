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
     * Block number of the first activity of the member across all plugins.
     */
    firstActive: number | null;
    /**
     * Block number of the last activity of the member across all plugins.
     */
    lastActive: number | null;
    /**
     * Metrics of the member.
     */
    metrics: IMemberMetrics;
}
