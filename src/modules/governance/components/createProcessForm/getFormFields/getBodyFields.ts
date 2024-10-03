import { useFormField } from '@/shared/hooks/useFormField';
import { useFieldArray } from 'react-hook-form';

export type BodyInputItemBaseForm = Record<string, any>;

export const getBodyNameField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<BodyInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.bodyName`>(
        `${stageName}.${stageIndex}.bodies.${bodyIndex}.bodyName`,
        {
            label: 'Name',
            defaultValue: '',
            trimOnBlur: true,
            rules: { required: true },
        },
    );

export const getBodyGovernanceTypeField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.bodyGovernanceType`
    >(`${stageName}.${stageIndex}.bodies.${bodyIndex}.bodyGovernanceType`, {
        label: 'Governance type',
        defaultValue: 'tokenVoting',
    });

export const getTokenNameField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.tokenName`
    >(`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenName`, {
        label: 'Name',
        defaultValue: '',
        rules: { required: true },
    });

export const getTokenSymbolField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.tokenSymbol`
    >(`${stageName}.${stageIndex}.bodies.${bodyIndex}.tokenSymbol`, {
        label: 'Symbol',
        defaultValue: '',
        rules: {
            maxLength: 10,
            required: true,
            validate: (value) => /^[A-Za-z]+$/.test(value) || 'Only letters are allowed',
        },
    });

export const getSupportThresholdPercentageField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.thresholdPercentage`
    >(`${stageName}.${stageIndex}.bodies.${bodyIndex}.thresholdPercentage`, {
        label: 'Support threshold',
        defaultValue: 50,
    });

export const getMinimumParticipationPercentageField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.participationPercentage`
    >(`${stageName}.${stageIndex}.bodies.${bodyIndex}.participationPercentage`, {
        label: 'Minimum participation',
        defaultValue: 50,
    });

export const getVoteChangeField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.voteChange`
    >(`${stageName}.${stageIndex}.bodies.${bodyIndex}.voteChange`, {
        label: 'Vote change',
        defaultValue: false,
    });

export const getMultisigThresholdField = (stageName: string, stageIndex: number, bodyIndex: number) =>
    useFormField<
        BodyInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodies.${typeof bodyIndex}.multisigThreshold`
    >(`${stageName}.${stageIndex}.bodies.${bodyIndex}.multisigThreshold`, {
        label: 'Approval Threshold',
        defaultValue: 1,
        rules: {
            min: {
                value: 1,
                message: 'Threshold must be at least 1',
            },
        },
    });

export const getBodyFieldsArray = (stageName: string, stageIndex: number) => {
    const bodyFieldArrayName = `${stageName}.${stageIndex}.bodies`;
    const { fields, append, remove, update } = useFieldArray({ name: bodyFieldArrayName });
    return { fields, appendBody: append, removeBody: remove, updateBody: update };
};

export const getAllBodyFields = (stageName: string, stageIndex: number, bodyIndex: number) => ({
    bodyNameField: getBodyNameField(stageName, stageIndex, bodyIndex),
    bodyGovernanceTypeField: getBodyGovernanceTypeField(stageName, stageIndex, bodyIndex),
    tokenNameField: getTokenNameField(stageName, stageIndex, bodyIndex),
    tokenSymbolField: getTokenSymbolField(stageName, stageIndex, bodyIndex),
    supportThresholdPercentageField: getSupportThresholdPercentageField(stageName, stageIndex, bodyIndex),
    minimumParticipationPercentageField: getMinimumParticipationPercentageField(stageName, stageIndex, bodyIndex),
    voteChangeField: getVoteChangeField(stageName, stageIndex, bodyIndex),
    multisigThresholdField: getMultisigThresholdField(stageName, stageIndex, bodyIndex),
});
