import type { SppProposalType } from '@/plugins/sppPlugin/types';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigSettledReport } from '../useSafeMultisigBodyState';

/**
 * Why the scan stopped. A miss is not one answer: "this Safe never reported" and "the report may be
 * further back than the budget allows" are different claims, and only the first is final.
 */
export enum SafeSettledReportOutcome {
    /**
     * An executed, successful report matching the recorded verdict was recovered.
     */
    FOUND = 'FOUND',
    /**
     * The Safe's whole available history was walked without a match. The report does not exist.
     */
    NOT_REPORTED = 'NOT_REPORTED',
    /**
     * The page budget ran out with history still unread. The answer is unknown, not negative.
     */
    SCAN_EXHAUSTED = 'SCAN_EXHAUSTED',
}

export type ISafeSettledReportScan =
    | ({
          outcome: SafeSettledReportOutcome.FOUND;
      } & ISafeMultisigSettledReport)
    | {
          outcome:
              | SafeSettledReportOutcome.NOT_REPORTED
              | SafeSettledReportOutcome.SCAN_EXHAUSTED;
      };

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
     * The verdict SPP has recorded for this body. A correlating transaction that reported the
     * opposite result did not produce this verdict and is not its evidence.
     */
    resultType: SppProposalType;
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
     * The executed report, set only when the outcome is `FOUND`.
     */
    settledReport?: ISafeMultisigSettledReport;
    /**
     * Why the scan stopped, or undefined while it runs or when it is off. Consumers that
     * distinguish "never reported" from "could not tell" read this rather than the absence of
     * `settledReport`.
     */
    outcome?: SafeSettledReportOutcome;
    /**
     * Whether the scan is still running.
     */
    isLoading: boolean;
    /**
     * Whether the scan failed.
     */
    isError: boolean;
}
