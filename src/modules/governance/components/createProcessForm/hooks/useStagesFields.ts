// src/hooks/useStageFields.ts
import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StageInputItemBaseForm = Record<string, any>;

interface StageFields {
    stageNameField: ReturnType<typeof useFormField>;
    stageTypeField: ReturnType<typeof useFormField>;
    votingPeriodField: ReturnType<typeof useFormField>;
    earlyStageField: ReturnType<typeof useFormField>;
    stageExpirationField: ReturnType<typeof useFormField>;
    stageExpirationPeriodField: ReturnType<typeof useFormField>;
}

export const useStageFields = (stageName: string, stageIndex: number): StageFields => {
    const basePath = `${stageName}.${stageIndex}` as const;

    const stageNameField = useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.stageName`>(
        `${basePath}.stageName`,
        {
            label: 'Name',
            rules: { required: true },
            defaultValue: '',
        },
    );

    const stageTypeField = useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.stageType`>(
        `${basePath}.stageType`,
        {
            label: 'Type',
            defaultValue: 'normal',
        },
    );

    const votingPeriodField = useFormField<
        Record<string, IDateDuration>,
        `${typeof stageName}.${typeof stageIndex}.votingPeriod`
    >(`${basePath}.votingPeriod`, {
        label: 'Voting Period',
        // @ts-expect-error - This is a valid default value
        defaultValue: {
            days: 7,
            hours: 0,
            minutes: 0,
        } as IDateDuration,
    });

    const earlyStageField = useFormField<
        StageInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.earlyStageAdvance`
    >(`${basePath}.earlyStageAdvance`, {
        label: 'Early stage advance',
        defaultValue: false,
    });

    const stageExpirationField = useFormField<
        StageInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.stageExpiration`
    >(`${basePath}.stageExpiration`, {
        label: 'Stage expiration',
        defaultValue: false,
    });

    const stageExpirationPeriodField = useFormField<
        Record<string, IDateDuration>,
        `${typeof stageName}.${typeof stageIndex}.expirationPeriod`
    >(`${basePath}.expirationPeriod`, {
        label: 'Expiration Period',
        // @ts-expect-error - This is a valid default value
        defaultValue: {
            days: 7,
            hours: 0,
            minutes: 0,
        } as IDateDuration,
    });

    return {
        stageNameField,
        stageTypeField,
        votingPeriodField,
        earlyStageField,
        stageExpirationField,
        stageExpirationPeriodField,
    };
};
