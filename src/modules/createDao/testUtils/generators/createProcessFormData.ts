import { type ICreateProcessFormData, ProposalCreationMode } from '../../components/createProcessForm';

export const generateCreateProcessFormData = (values?: Partial<ICreateProcessFormData>): ICreateProcessFormData => ({
    name: 'Test Process',
    processKey: 'KEY',
    description: 'Description',
    resources: [],
    stages: [],
    permissions: {
        proposalCreationMode: ProposalCreationMode.ANY_WALLET,
        proposalCreationBodies: [],
    },
    ...values,
});
