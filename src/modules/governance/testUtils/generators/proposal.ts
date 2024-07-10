import type { IProposal } from '../../api/governanceService';

export const generateProposal = (proposal?: Partial<IProposal>): IProposal => ({
    id: '1',
    title: 'Proposal title',
    endDate: 1234567890,
    summary: 'Proposal summary',
    creatorAddress: '0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5',
    ...proposal,
});
