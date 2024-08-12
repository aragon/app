import { type IMemberMetrics } from '@/modules/governance/api/governanceService/domain';

export interface IMember {
    /**
     * Address of the member.
     */
    address: string;
    /**
     * ENS name linked to the member address.
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
