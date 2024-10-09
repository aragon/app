/* eslint-disable @typescript-eslint/no-explicit-any */
import { BodyCreationDialogSteps } from '@/modules/governance/components/createProcessForm/createProcessFormBodyDialogStepper/createProcessFormBodyDialogStepper';
import type { UseFormGetValues, UseFormSetError, UseFormTrigger } from 'react-hook-form';

interface ValidateStepProps {
    step: BodyCreationDialogSteps;
    getValues: UseFormGetValues<any>;
    trigger: UseFormTrigger<any>;
    setError: UseFormSetError<any>;
    stageName: string;
    stageIndex: number;
    bodyIndex: number;
    bodyGovernanceType: string;
}

type ValidationFunction = (props: ValidateStepProps) => Promise<boolean>;

const validationMap: Record<BodyCreationDialogSteps, ValidationFunction> = {
    [BodyCreationDialogSteps.PLUGIN_SELECT]: async ({ trigger, stageName, stageIndex, bodyIndex }) => {
        const fieldPath = `${stageName}.${stageIndex}.bodies.${bodyIndex}.bodyGovernanceTypeField`;
        return await trigger(fieldPath);
    },
    [BodyCreationDialogSteps.PLUGIN_METADATA]: async ({ trigger, stageName, stageIndex, bodyIndex }) => {
        const fieldPaths = [
            `${stageName}.${stageIndex}.bodies.${bodyIndex}.bodyNameField`,
            `${stageName}.${stageIndex}.bodies.${bodyIndex}.bodySummaryField`,
        ];
        return await trigger(fieldPaths);
    },
    [BodyCreationDialogSteps.GOVERNANCE_DISTRO]: async ({
        trigger,
        getValues,
        setError,
        stageName,
        stageIndex,
        bodyIndex,
        bodyGovernanceType,
    }) => {
        const basePath = `${stageName}.${stageIndex}.bodies.${bodyIndex}`;

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
        return await trigger(fieldPaths);
    },
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: async ({
        trigger,
        stageName,
        stageIndex,
        bodyIndex,
        bodyGovernanceType,
    }) => {
        const basePath = `${stageName}.${stageIndex}.bodies.${bodyIndex}`;

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

export const validateStep = async (props: ValidateStepProps): Promise<boolean> => {
    const { step } = props;
    const validationFunction = validationMap[step];
    if (validationFunction) {
        return await validationFunction(props);
    }
    return false;
};
