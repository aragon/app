import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';

export interface IGetProposalStatusParams {
    /**
     * Defines if the proposal has already been executed or not.
     */
    isExecuted: boolean;
    /**
     * Defines if the proposal has been vetoed.
     */
    isVetoed: boolean;
    /**
     * Start date of the proposal in seconds.
     */
    startDate: number;
    /**
     * End date of the proposal in seconds, might be undefined when not known yet (for instance on multi-stage
     * proposals when the current active stage is not the last stage).
     */
    endDate?: number;
    /**
     * Expiration date of the proposal execution, might be undefined for plugins that define no expiry execution date
     * for proposals.
     */
    executionExpiryDate?: number;
    /**
     * Defines if the parameters have been met for the proposal to be considered as "accepted".
     */
    paramsMet: boolean;
    /**
     * Defines if the proposal has actions to be executed or not.
     */
    hasActions: boolean;
    /**
     * Defines if the proposal can be executed before the end date.
     */
    canExecuteEarly: boolean;
    /**
     * Defines if the proposal has stages that can be advanced, to be used for multi-stage proposals.
     */
    hasAdvanceableStages?: boolean;
    /**
     * Defines if any stage of the proposal has been expired, to be used for multi-stage proposals.
     */
    hasExpiredStages?: boolean;
}

class ProposalStatusUtils {
    getProposalStatus = (params: IGetProposalStatusParams) => {
        const {
            isExecuted,
            isVetoed,
            startDate,
            endDate,
            paramsMet,
            hasActions,
            executionExpiryDate,
            canExecuteEarly,
            hasAdvanceableStages,
            hasExpiredStages,
        } = params;

        const now = DateTime.now();
        const startsInTheFuture = now < DateTime.fromSeconds(startDate);
        const endsInTheFuture = endDate != null && now < DateTime.fromSeconds(endDate);
        const isExecutionExpired = executionExpiryDate != null && now > DateTime.fromSeconds(executionExpiryDate);

        if (isExecuted) {
            return ProposalStatus.EXECUTED;
        }

        if (isVetoed) {
            return ProposalStatus.VETOED;
        }

        if (startsInTheFuture) {
            return ProposalStatus.PENDING;
        }

        if (hasAdvanceableStages) {
            return ProposalStatus.ADVANCEABLE;
        }

        if (hasExpiredStages) {
            return ProposalStatus.EXPIRED;
        }

        if (endsInTheFuture) {
            const isExecutable = paramsMet && hasActions && canExecuteEarly;

            return isExecutable ? ProposalStatus.EXECUTABLE : ProposalStatus.ACTIVE;
        }

        if (!paramsMet) {
            return ProposalStatus.REJECTED;
        }

        if (!hasActions) {
            return ProposalStatus.ACCEPTED;
        }

        return isExecutionExpired ? ProposalStatus.EXPIRED : ProposalStatus.EXECUTABLE;
    };
}

export const proposalStatusUtils = new ProposalStatusUtils();
