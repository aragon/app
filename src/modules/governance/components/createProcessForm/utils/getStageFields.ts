import { useFormField } from '@/shared/hooks/useFormField';
import { IDateDuration } from '@/shared/utils/dateUtils';

export type StageInputItemBaseForm = Record<string, any>;

export const getStageNameField = (stageName: string, stageIndex: number) =>
    useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.stageName`>(
        `${stageName}.${stageIndex}.stageName`,
        {
            label: 'Name',
            rules: { required: true },
            defaultValue: '',
        },
    );

export const getStageTypeField = (stageName: string, stageIndex: number) =>
    useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.type`>(
        `${stageName}.${stageIndex}.type`,
        {
            label: 'Type',
            defaultValue: 'normal',
        },
    );

export const getVotingPeriodField = (stageName: string, stageIndex: number) =>
    useFormField<Record<string, IDateDuration>, `${typeof stageName}.${typeof stageIndex}.votingPeriod`>(
        `${stageName}.${stageIndex}.votingPeriod`,
        {
            label: 'Voting Period',
            defaultValue: {
                days: 7,
                hours: 0,
                minutes: 0,
            } as any,
        },
    );

export const getEarlyStageField = (stageName: string, stageIndex: number) =>
    useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.earlyStage`>(
        `${stageName}.${stageIndex}.earlyStage`,
        {
            label: 'Early stage advance',
            defaultValue: false,
        },
    );

export const getStageExpirationField = (stageName: string, stageIndex: number) =>
    useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.stageExpiration`>(
        `${stageName}.${stageIndex}.stageExpiration`,
        {
            label: 'Stage expiration',
            defaultValue: false,
        },
    );

export const getStageExpirationPeriodField = (stageName: string, stageIndex: number) =>
    useFormField<Record<string, IDateDuration>, `${typeof stageName}.${typeof stageIndex}.expirationPeriod`>(
        `${stageName}.${stageIndex}.expirationPeriod`,
        {
            label: 'Expiration Period',
            defaultValue: {
                days: 7,
                hours: 0,
                minutes: 0,
            } as any,
        },
    );

export const getAllStageFields = (stageName: string, stageIndex: number) => ({
    stageNameField: getStageNameField(stageName, stageIndex),
    stageTypeField: getStageTypeField(stageName, stageIndex),
    votingPeriodField: getVotingPeriodField(stageName, stageIndex),
    earlyStageField: getEarlyStageField(stageName, stageIndex),
    stageExpirationField: getStageExpirationField(stageName, stageIndex),
    stageExpirationPeriodField: getStageExpirationPeriodField(stageName, stageIndex),
});
