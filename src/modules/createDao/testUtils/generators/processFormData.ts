import {
    GovernanceType,
    type ICreateProcessFormData,
    type ICreateProcessFormDataAdvanced,
    type ICreateProcessFormDataBase,
    type ICreateProcessFormDataBasic,
    type ICreateProcessFormStage,
    ProcessPermission,
    ProcessStageType,
    ProposalCreationMode,
} from '../../components/createProcessForm';
import { generateSetupBodyFormNew } from './setupBodyForm';

export const generateCreateProcessFormDataBase = (
    values?: Partial<ICreateProcessFormData>,
): ICreateProcessFormDataBase => ({
    name: 'Test Process',
    processKey: 'KEY',
    description: 'Description',
    resources: [],
    proposalCreationMode: ProposalCreationMode.LISTED_BODIES,
    governanceType: GovernanceType.BASIC,
    permissions: ProcessPermission.ANY,
    permissionSelectors: [],
    ...values,
});

export const generateCreateProcessFormDataAdvanced = (
    values?: Partial<ICreateProcessFormDataAdvanced>,
): ICreateProcessFormDataAdvanced => ({
    ...generateCreateProcessFormDataBase(values),
    governanceType: GovernanceType.ADVANCED,
    stages: [],
    ...values,
});

export const generateCreateProcessFormDataBasic = (
    values?: Partial<ICreateProcessFormDataBasic>,
): ICreateProcessFormDataBasic => ({
    ...generateCreateProcessFormDataBase(values),
    governanceType: GovernanceType.BASIC,
    body: generateSetupBodyFormNew(),
    ...values,
});

export const generateCreateProcessFormData = (
    values?: Partial<ICreateProcessFormData>,
): ICreateProcessFormData =>
    values?.governanceType === GovernanceType.BASIC
        ? generateCreateProcessFormDataBasic(values)
        : generateCreateProcessFormDataAdvanced(
              values as ICreateProcessFormDataAdvanced,
          );

export const generateCreateProcessFormStageSettings = (
    values?: Partial<ICreateProcessFormStage['settings']>,
): ICreateProcessFormStage['settings'] => ({
    type: ProcessStageType.NORMAL,
    votingPeriod: { days: 1, hours: 0, minutes: 0 },
    earlyStageAdvance: true,
    requiredApprovals: 1,
    ...values,
});

export const generateCreateProcessFormStage = (
    values?: Partial<ICreateProcessFormStage>,
): ICreateProcessFormStage => ({
    internalId: '0',
    name: 'stage',
    settings: generateCreateProcessFormStageSettings(values?.settings),
    bodies: [],
    ...values,
});
