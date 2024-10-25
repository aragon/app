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

export interface ICreateProcessFormBodyDialogStepsProps {
    fieldPrefix: string;
    bodyGovernanceType: string;
}

export const CreateProcessFormBodyDialogSteps: Record<
    BodyCreationDialogSteps,
    (props: ICreateProcessFormBodyDialogStepsProps) => React.ReactNode
> = {
    [BodyCreationDialogSteps.PLUGIN_SELECT]: (props) => <CreateProcessFormPluginSelect {...props} />,
    [BodyCreationDialogSteps.PLUGIN_METADATA]: (props) => <CreateProcessFormPluginMetadata {...props} />,
    [BodyCreationDialogSteps.GOVERNANCE_DISTRO]: (props) =>
        props.bodyGovernanceType === 'tokenVoting' ? (
            <CreateProcessFormTokenVotingDistro {...props} />
        ) : (
            <CreateProcessFormMultisigDistro {...props} />
        ),
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: (props) =>
        props.bodyGovernanceType === 'tokenVoting' ? (
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
        const fieldPath = `${stageFieldName}.bodies.${bodyIndex}.governanceType`;
        return await trigger(fieldPath);
    },
    [BodyCreationDialogSteps.PLUGIN_METADATA]: async ({ trigger, stageFieldName, bodyIndex }) => {
        const fieldPaths = [
            `${stageFieldName}.bodies.${bodyIndex}.name`,
            `${stageFieldName}.bodies.${bodyIndex}.description`,
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
            fieldPaths = [`${basePath}.tokenName`, `${basePath}.tokenSymbol`, `${basePath}.members`];
        } else {
            fieldPaths = [`${basePath}.multisigThreshold`, `${basePath}.members`];
        }

        const result = await trigger(fieldPaths);

        return result;
    },
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: async ({ trigger, stageFieldName, bodyIndex, bodyGovernanceType }) => {
        const basePath = `${stageFieldName}.bodies.${bodyIndex}`;

        let fieldPaths: string[];
        if (bodyGovernanceType === 'tokenVoting') {
            fieldPaths = [`${basePath}.supportThreshold`, `${basePath}.minimumParticipation`, `${basePath}.voteChange`];
        } else {
            fieldPaths = [`${basePath}.supportThreshold`];
        }
        return await trigger(fieldPaths);
    },
};
