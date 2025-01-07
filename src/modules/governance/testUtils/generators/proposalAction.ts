import type { IProposalAction } from '../../api/governanceService';

export const generateProposalAction = (action?: Partial<IProposalAction>): IProposalAction => ({
    type: 'unknown',
    from: '0x123',
    to: '0x456',
    data: '0x',
    value: '0',
    inputData: null,
    ...action,
});
