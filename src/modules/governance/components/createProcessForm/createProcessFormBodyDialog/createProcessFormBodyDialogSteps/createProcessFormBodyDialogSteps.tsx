import { BodyCreationDialogSteps } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialogStepper/createProcessFormBodyDialogStepper';
import {
    CreateProcessFormMultisigDistro,
    CreateProcessFormMultisigParams,
    CreateProcessFormPluginMetadata,
    CreateProcessFormPluginSelect,
    CreateProcessFormTokenVotingDistro,
    CreateProcessFormTokenVotingParams,
} from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows';

interface ICreateProcessFormBodyDialogStepsProps {
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
    bodyGovernanceType: string;
}

export const CreateProcessFormBodyDialogSteps: Record<
    BodyCreationDialogSteps,
    (props: ICreateProcessFormBodyDialogStepsProps) => React.ReactNode
> = {
    [BodyCreationDialogSteps.PLUGIN_SELECT]: ({ stageName, stageIndex, bodyIndex }) => (
        <CreateProcessFormPluginSelect stageName={stageName} stageIndex={stageIndex} bodyIndex={bodyIndex} />
    ),
    [BodyCreationDialogSteps.PLUGIN_METADATA]: ({ stageName, stageIndex, bodyIndex }) => (
        <CreateProcessFormPluginMetadata stageName={stageName} stageIndex={stageIndex} bodyIndex={bodyIndex} />
    ),
    [BodyCreationDialogSteps.GOVERNANCE_DISTRO]: ({ stageName, stageIndex, bodyIndex, bodyGovernanceType }) =>
        bodyGovernanceType === 'tokenVoting' ? (
            <CreateProcessFormTokenVotingDistro stageName={stageName} stageIndex={stageIndex} bodyIndex={bodyIndex} />
        ) : (
            <CreateProcessFormMultisigDistro stageName={stageName} stageIndex={stageIndex} bodyIndex={bodyIndex} />
        ),
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: ({ stageName, stageIndex, bodyIndex, bodyGovernanceType }) =>
        bodyGovernanceType === 'tokenVoting' ? (
            <CreateProcessFormTokenVotingParams stageName={stageName} stageIndex={stageIndex} bodyIndex={bodyIndex} />
        ) : (
            <CreateProcessFormMultisigParams stageName={stageName} stageIndex={stageIndex} bodyIndex={bodyIndex} />
        ),
};
