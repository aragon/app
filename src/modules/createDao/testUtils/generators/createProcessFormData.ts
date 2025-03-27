import {
    type ICreateProcessFormData,
    type ICreateProcessFormStage,
    ProcessStageType,
    ProposalCreationMode,
} from '../../components/createProcessForm';

export const generateCreateProcessFormBody = (
    values?: Partial<ICreateProcessFormData['bodies'][number]>,
): ICreateProcessFormData['bodies'][number] => ({
    id: 'body1',
    name: 'body1',
    resources: [],
    plugin: 'multisig',
    governance: null,
    membership: null,
    ...values,
});

export const generateCreateProcessFormStage = (values?: Partial<ICreateProcessFormStage>): ICreateProcessFormStage => ({
    name: 'stage',
    type: ProcessStageType.NORMAL,
    timing: {
        votingPeriod: { days: 1, hours: 0, minutes: 0 },
        earlyStageAdvance: false,
    },
    requiredApprovals: 1,
    ...values,
});

export const generateCreateProcessFormData = (values?: Partial<ICreateProcessFormData>): ICreateProcessFormData => ({
    name: 'Test Process',
    processKey: 'KEY',
    description: 'Description',
    resources: [],
    stages: [],
    bodies: [],
    permissions: {
        proposalCreationMode: ProposalCreationMode.ANY_WALLET,
        proposalCreationBodies: [],
    },
    ...values,
});
