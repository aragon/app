// src/hooks/useStageFields.ts
import {
    IStageFields,
    StageInputItemBaseForm,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export const useStageFields = (stageName: string, stageIndex: number): IStageFields => {
    const basePath = `${stageName}.${stageIndex}` as const;

    const stageNameField = useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.stageName`>(
        `${basePath}.stageName`,
        {
            label: 'Name',
            trimOnBlur: true,
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
