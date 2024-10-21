/* eslint-disable @typescript-eslint/no-explicit-any */
import { BodyCreationDialogSteps } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialogStepper/createProcessFormBodyDialogStepper';
import {
    CreateProcessFormMultisigDistro,
    CreateProcessFormMultisigParams,
    CreateProcessFormPluginMetadata,
    CreateProcessFormPluginSelect,
    CreateProcessFormTokenVotingDistro,
    CreateProcessFormTokenVotingParams,
} from '@/modules/governance/components/createProcessForm/createProcessFormPluginFlows';
import type { UseFormGetValues, UseFormSetError, UseFormTrigger } from 'react-hook-form';

interface ICreateProcessFormBodyDialogStepsProps {
    stageFieldName: string;
    bodyIndex: number;
    bodyGovernanceType: string;
}

export const CreateProcessFormBodyDialogSteps: Record<
    BodyCreationDialogSteps,
    (props: ICreateProcessFormBodyDialogStepsProps) => React.ReactNode
> = {
    [BodyCreationDialogSteps.PLUGIN_SELECT]: (props) => <CreateProcessFormPluginSelect {...props} />,
    [BodyCreationDialogSteps.PLUGIN_METADATA]: (props) => <CreateProcessFormPluginMetadata {...props} />,
    [BodyCreationDialogSteps.GOVERNANCE_DISTRO]: ({ bodyGovernanceType, ...props }) =>
        bodyGovernanceType === 'tokenVoting' ? (
            <CreateProcessFormTokenVotingDistro {...props} />
        ) : (
            <CreateProcessFormMultisigDistro {...props} />
        ),
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: ({ bodyGovernanceType, ...props }) =>
        bodyGovernanceType === 'tokenVoting' ? (
            <CreateProcessFormTokenVotingParams {...props} />
        ) : (
            <CreateProcessFormMultisigParams {...props} />
        ),
};

interface ValidateStepProps {
    step: BodyCreationDialogSteps;
    getValues: UseFormGetValues<any>;
    trigger: UseFormTrigger<any>;
    setError: UseFormSetError<any>;
    stageFieldName: string;
    bodyIndex: number;
    bodyGovernanceType: string;
}

type ValidationFunction = (props: ValidateStepProps) => Promise<boolean>;

export const validationMap: Record<BodyCreationDialogSteps, ValidationFunction> = {
    [BodyCreationDialogSteps.PLUGIN_SELECT]: async ({ trigger, stageFieldName, bodyIndex }) => {
        const fieldPath = `${stageFieldName}.bodies.${bodyIndex}.bodyGovernanceTypeField`;
        return await trigger(fieldPath);
    },
    [BodyCreationDialogSteps.PLUGIN_METADATA]: async ({ trigger, stageFieldName, bodyIndex }) => {
        const fieldPaths = [
            `${stageFieldName}.bodies.${bodyIndex}.bodyNameField`,
            `${stageFieldName}.bodies.${bodyIndex}.bodySummaryField`,
        ];
        return await trigger(fieldPaths);
    },
    [BodyCreationDialogSteps.GOVERNANCE_DISTRO]: async ({
        trigger,
        getValues,
        setError,
        stageFieldName,
        bodyIndex,
        bodyGovernanceType,
    }) => {
        const basePath = `${stageFieldName}.bodies.${bodyIndex}`;

        const members = getValues(`${basePath}.members`);

        if (!members || members.length === 0) {
            setError(`${basePath}.members`, {
                type: 'manual',
                message: 'At least one member is required',
            });
        }

        let fieldPaths: string[];

        if (bodyGovernanceType === 'tokenVoting') {
            fieldPaths = [`${basePath}.tokenNameField`, `${basePath}.tokenSymbolField`, `${basePath}.members`];
        } else {
            fieldPaths = [`${basePath}.multisigThresholdField`, `${basePath}.members`];
        }

        const result = await trigger(fieldPaths);

        return result;
    },
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: async ({ trigger, stageFieldName, bodyIndex, bodyGovernanceType }) => {
        const basePath = `${stageFieldName}.bodies.${bodyIndex}`;

        let fieldPaths: string[];
        if (bodyGovernanceType === 'tokenVoting') {
            fieldPaths = [
                `${basePath}.supportThresholdField`,
                `${basePath}.minimumParticipationField`,
                `${basePath}.voteChangeField`,
            ];
        } else {
            fieldPaths = [`${basePath}.multisigThresholdField`];
        }
        return await trigger(fieldPaths);
    },
};
