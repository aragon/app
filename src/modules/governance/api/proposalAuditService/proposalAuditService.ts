import { AragonBackendService } from '@/shared/api/aragonBackendService';
import type { IProposalAudit } from '../governanceService/domain';
import type { IRunProposalAuditParams } from './proposalAuditService.api';

class ProposalAuditService extends AragonBackendService {
    private urls = {
        runAudit: '/v2/proposals/:id/audit',
    };

    runAudit = async (
        params: IRunProposalAuditParams,
    ): Promise<IProposalAudit> => {
        const result = await this.request<IProposalAudit>(
            this.urls.runAudit,
            params,
            { method: 'POST' },
        );
        return result;
    };
}

export const proposalAuditService = new ProposalAuditService();
