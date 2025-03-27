/* eslint-disable @typescript-eslint/no-explicit-any */
import type { UseFormGetValues, UseFormSetError, UseFormTrigger } from 'react-hook-form';
import {
    CreateProcessFormMultisigDistro,
    CreateProcessFormMultisigParams,
    CreateProcessFormPluginMetadata,
    CreateProcessFormPluginSelect,
    CreateProcessFormTokenVotingDistro,
    CreateProcessFormTokenVotingParams,
} from '../../../../../components/createProcessForm/createProcessFormPluginFlows';

export interface ICreateProcessFormBodyDialogStepsProps {
    fieldPrefix: string;
    bodyGovernanceType: string;
}

export enum BodyCreationDialogSteps {
    PLUGIN_SELECT = 'PLUGIN_SELECT',
    PLUGIN_METADATA = 'PLUGIN_METADATA',
    GOVERNANCE_DISTRO = 'GOVERNANCE_DISTRO',
    GOVERNANCE_PARAMS = 'GOVERNANCE_PARAMS',
}

export const orderedBodyCreationDialogSteps: BodyCreationDialogSteps[] = [
    BodyCreationDialogSteps.PLUGIN_SELECT,
    BodyCreationDialogSteps.PLUGIN_METADATA,
    BodyCreationDialogSteps.GOVERNANCE_DISTRO,
    BodyCreationDialogSteps.GOVERNANCE_PARAMS,
];

export const CreateProcessFormBodyDialogSteps: Record<
    BodyCreationDialogSteps,
    (props: ICreateProcessFormBodyDialogStepsProps) => React.ReactNode
> = {
    [BodyCreationDialogSteps.PLUGIN_SELECT]: (props) => <CreateProcessFormPluginSelect {...props} />,
    [BodyCreationDialogSteps.PLUGIN_METADATA]: (props) => <CreateProcessFormPluginMetadata {...props} />,
    [BodyCreationDialogSteps.GOVERNANCE_DISTRO]: (props) =>
        props.bodyGovernanceType === 'token-voting' ? (
            <CreateProcessFormTokenVotingDistro {...props} />
        ) : (
            <CreateProcessFormMultisigDistro {...props} />
        ),
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: (props) =>
        props.bodyGovernanceType === 'token-voting' ? (
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
        const fieldPath = `${stageFieldName}.bodies.${bodyIndex.toString()}.governanceType`;
        return await trigger(fieldPath);
    },
    [BodyCreationDialogSteps.PLUGIN_METADATA]: async ({ trigger, stageFieldName, bodyIndex }) => {
        const fieldPaths = [
            `${stageFieldName}.bodies.${bodyIndex.toString()}.name`,
            `${stageFieldName}.bodies.${bodyIndex.toString()}.description`,
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
        const basePath = `${stageFieldName}.bodies.${bodyIndex.toString()}`;

        const members = getValues(`${basePath}.members`) as any[] | undefined;

        if (!members || members.length === 0) {
            setError(`${basePath}.members`, {
                type: 'manual',
                message: 'At least one member is required',
            });
        }

        let fieldPaths: string[];

        if (bodyGovernanceType === 'token-voting') {
            fieldPaths = [`${basePath}.tokenName`, `${basePath}.tokenSymbol`, `${basePath}.members`];
        } else {
            fieldPaths = [`${basePath}.minApprovals`, `${basePath}.members`];
        }

        const result = await trigger(fieldPaths);

        return result;
    },
    [BodyCreationDialogSteps.GOVERNANCE_PARAMS]: async ({ trigger, stageFieldName, bodyIndex, bodyGovernanceType }) => {
        const basePath = `${stageFieldName}.bodies.${bodyIndex.toString()}`;

        let fieldPaths: string[];
        if (bodyGovernanceType === 'token-voting') {
            fieldPaths = [`${basePath}.supportThreshold`, `${basePath}.minParticipation`, `${basePath}.voteChange`];
        } else {
            fieldPaths = [`${basePath}.supportThreshold`];
        }
        return await trigger(fieldPaths);
    },
};
