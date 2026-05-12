import { type MutationOptions, useMutation } from '@tanstack/react-query';
import type { IProposalAudit } from '../../../governanceService/domain';
import { proposalAuditService } from '../../proposalAuditService';
import type { IRunProposalAuditParams } from '../../proposalAuditService.api';

export const useRunProposalAudit = (
    options?: MutationOptions<IProposalAudit, unknown, IRunProposalAuditParams>,
) =>
    useMutation({
        mutationFn: (params) => proposalAuditService.runAudit(params),
        ...options,
    });
