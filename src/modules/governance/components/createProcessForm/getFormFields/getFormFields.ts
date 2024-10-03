import { StageInputItemBaseForm } from '@/modules/governance/components/createProcessForm/stageInput/stageInputItem';
import { useFormField } from '@/shared/hooks/useFormField';
import { IDateDuration } from '@/shared/utils/dateUtils';
import { useFieldArray } from 'react-hook-form';

export const getStageNameField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.stageName`>(`${name}.${index}.stageName`, {
        label: 'Name',
        rules: { required: true },
        defaultValue: '',
    });

export const getTypeField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.type`>(`${name}.${index}.type`, {
        label: 'Type',
        defaultValue: 'normal',
    });

export const getTimingField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.timing`>(`${name}.${index}.timing`, {
        label: 'Timing',
        defaultValue: 'normal',
    });

export const getVotingPeriodField = (name: string, index: number) =>
    useFormField<Record<string, IDateDuration>, `${typeof name}.${typeof index}.votingPeriod`>(
        `${name}.${index}.votingPeriod`,
        {
            label: 'Voting Period',
            defaultValue: {
                days: 7,
                hours: 0,
                minutes: 0,
            } as any,
        },
    );

export const getEarlyStageField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.earlyStage`>(`${name}.${index}.earlyStage`, {
        label: 'Early stage advance',
        defaultValue: false,
    });

export const getStageExpirationField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.stageExpiration`>(
        `${name}.${index}.stageExpiration`,
        {
            label: 'Stage expiration',
            defaultValue: false,
        },
    );

export const getStageExpirationPeriodField = (name: string, index: number) =>
    useFormField<Record<string, IDateDuration>, `${typeof name}.${typeof index}.expirationPeriod`>(
        `${name}.${index}.expirationPeriod`,
        {
            label: 'Expiration Period',
            defaultValue: {
                days: 7,
                hours: 0,
                minutes: 0,
            } as any,
        },
    );
export const getSupportThresholdPercentageField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.thresholdPercentage`>(
        `${name}.${index}.thresholdPercentage`,
        {
            label: 'Support threshold',
            defaultValue: 50,
        },
    );

export const getMinimumParticipationPercentageField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.participationPercentage`>(
        `${name}.${index}.participationPercentage`,
        {
            label: 'Minimum participation',
            defaultValue: 50,
        },
    );

export const getVoteChangeField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.voteChange`>(`${name}.${index}.voteChange`, {
        label: 'Vote change',
        defaultValue: false,
    });

export const getTokenNameField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.tokenName`>(`${name}.${index}.tokenName`, {
        label: 'Name',
        defaultValue: '',
    });

export const getTokenSymbolField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.tokenSymbol`>(`${name}.${index}.tokenSymbol`, {
        label: 'Symbol',
        defaultValue: '',
    });

export const getBodyNameField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.bodyName`>(`${name}.${index}.bodyName`, {
        label: 'Name',
        defaultValue: '',
        trimOnBlur: true,
    });

export const getMultisigThresholdField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.multisigThreshold`>(
        `${name}.${index}.multisigThreshold`,
        {
            label: 'Approval Threshold',
            defaultValue: 1,
            rules: {
                min: {
                    value: 1,
                    message: 'Threshold must be at least 1',
                },
            },
        },
    );

export const getBodyGovernanceTypeField = (name: string, index: number) =>
    useFormField<StageInputItemBaseForm, `${typeof name}.${typeof index}.bodyGovernanceType`>(
        `${name}.${index}.bodyGovernanceType`,
        {
            defaultValue: 'tokenVoting',
        },
    );

export const getBodyFields = (name: string, index: number) => {
    const bodyFieldArrayName = `${name}.${index}.bodies`;
    const { fields, append, remove, update } = useFieldArray({ name: bodyFieldArrayName });
    return { fields, append, remove, update };
};

export const getAllStageFields = (name: string, index: number) => ({
    stageNameField: getStageNameField(name, index),
    typeField: getTypeField(name, index),
    timingField: getTimingField(name, index),
    votingPeriodField: getVotingPeriodField(name, index),
    earlyStageField: getEarlyStageField(name, index),
    stageExpirationField: getStageExpirationField(name, index),
    stageExpirationPeriodField: getStageExpirationPeriodField(name, index),
    supportThresholdPercentageField: getSupportThresholdPercentageField(name, index),
    minimumParticipationPercentageField: getMinimumParticipationPercentageField(name, index),
    voteChangeField: getVoteChangeField(name, index),
    tokenNameField: getTokenNameField(name, index),
    tokenSymbolField: getTokenSymbolField(name, index),
    bodyNameField: getBodyNameField(name, index),
    bodyGovernanceTypeField: getBodyGovernanceTypeField(name, index),
    bodyFields: getBodyFields(name, index),
    multisigThresholdField: getMultisigThresholdField(name, index),
});
