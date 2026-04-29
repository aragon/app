import type { IRequestUrlParams } from '@/shared/api/httpService';

export interface IRunProposalAuditUrlParams {
    /**
     * Entity id of the proposal to audit, in
     * `<transactionHash>-<pluginAddress>-<proposalIndex>` format.
     */
    id: string;
}

export interface IRunProposalAuditParams
    extends IRequestUrlParams<IRunProposalAuditUrlParams> {}
