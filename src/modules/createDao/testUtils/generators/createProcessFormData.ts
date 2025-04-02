import {
    GovernanceType,
    type ICreateProcessFormData,
    type ICreateProcessFormStage,
    ProcessStageType,
    ProposalCreationMode,
} from '../../components/createProcessForm';

export const generateCreateProcessFormBody = (
    values?: Partial<ICreateProcessFormData['bodies'][number]>,
): ICreateProcessFormData['bodies'][number] => ({
    internalId: 'body1',
    name: 'body1',
    resources: [],
    plugin: 'multisig',
    governance: {},
    membership: { members: [] },
    canCreateProposal: false,
    ...values,
});

export const generateCreateProcessFormStage = (values?: Partial<ICreateProcessFormStage>): ICreateProcessFormStage => ({
    internalId: '0',
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
    proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
    governanceType: GovernanceType.BASIC,
    ...values,
});
