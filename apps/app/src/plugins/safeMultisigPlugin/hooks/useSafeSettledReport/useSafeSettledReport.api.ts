import type { DateTime } from 'luxon';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigSettledReport } from '../useSafeMultisigBodyState';

export interface IFindSettledReportParams {
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Address of the Safe acting as the body.
     */
    address: string;
    /**
     * Address of the SPP plugin the report targets.
     */
    pluginAddress: string;
    /**
     * Id of the proposal the report carries a verdict for.
     */
    proposalId: bigint;
    /**
     * Index of the stage the report was made on.
     */
    stageId: number;
    /**
     * Earliest execution date worth scanning: the stage's start date. `reportProposalResult` reverts
     * for a stage that has not started, so nothing before it can carry this verdict.
     */
    notBefore?: DateTime;
}

export interface IUseSafeSettledReportParams extends IFindSettledReportParams {
    /**
     * Whether to run the scan. The read costs Safe quota, so it stays off until a verdict is
     * actually recorded for this body.
     */
    enabled: boolean;
}

export interface IUseSafeSettledReportReturn {
    /**
     * The executed report, or undefined while scanning, when the scan is off, or when the report is
     * beyond the scanned window.
     */
    settledReport?: ISafeMultisigSettledReport;
    /**
     * Whether the scan is still running.
     */
    isLoading: boolean;
    /**
     * Whether the scan failed.
     */
    isError: boolean;
}
