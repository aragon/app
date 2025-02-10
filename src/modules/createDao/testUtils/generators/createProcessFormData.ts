import {
    type ICreateProcessFormBody,
    type ICreateProcessFormData,
    type ICreateProcessFormStage,
    ProcessStageType,
    ProposalCreationMode,
} from '../../components/createProcessForm';

export const generateCreateProcessFormBody = (values?: Partial<ICreateProcessFormBody>): ICreateProcessFormBody => ({
    id: 'body1',
    name: 'body1',
    resources: [],
    governanceType: 'multisig',
    members: [],
    tokenType: 'new',
    supportThreshold: 1,
    minimumParticipation: 1,
    voteChange: false,
    multisigThreshold: 1,
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
    bodies: [],
    ...values,
});

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
