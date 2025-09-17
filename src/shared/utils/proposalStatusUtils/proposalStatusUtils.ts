import { ProposalStatus } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import type { IGetProposalStatusParams, IHasEndedParams } from './proposalStatusUtils.api';

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
        const endsInTheFuture = this.endsInTheFuture(endDate);
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

    endsInTheFuture = (endDate?: number) => {
        const now = DateTime.now().toSeconds();

        return endDate == null || now < endDate;
    };

    hasEnded = (params: IHasEndedParams) => {
        const { endDate, isExecuted } = params;
        const now = DateTime.now().toSeconds();
        const hasEndDatePassed = endDate != null && now > endDate;

        return hasEndDatePassed || isExecuted;
    };
}

export const proposalStatusUtils = new ProposalStatusUtils();
