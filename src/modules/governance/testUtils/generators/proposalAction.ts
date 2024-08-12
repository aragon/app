import { IProposalAction } from '@aragon/ods';

export const generateProposalAction = (action?: Partial<IProposalAction>): IProposalAction => ({
    type: '',
    from: '',
    to: '',
    data: '',
    value: '',
    inputData: {
        function: '',
        contract: '',
        parameters: [{ name: '', type: '', value: '' }],
    },
    ...action,
});
