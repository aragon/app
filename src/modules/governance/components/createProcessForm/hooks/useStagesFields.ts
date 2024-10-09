// src/hooks/useStageFields.ts
import type {
    IStageFields,
    StageInputItemBaseForm,
} from '@/modules/governance/components/createProcessForm/createProcessFormDefinitions';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type { IDateDuration } from '@/shared/utils/dateUtils';

export const useStageFields = (stageName: string, stageIndex: number): IStageFields => {
    const basePath = `${stageName}.${stageIndex}` as const;

    const { t } = useTranslations();

    const stageNameField = useFormField<StageInputItemBaseForm, `${typeof stageName}.${typeof stageIndex}.stageName`>(
        `${basePath}.stageName`,
        {
            label: t('app.governance.createProcessForm.stage.name.label'),
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
        label: t('app.governance.createProcessForm.stage.timing.dialog.votingPeriod.label'),
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
        label: t('app.governance.createProcessForm.stage.timing.dialog.earlyAdvance.label'),
        defaultValue: false,
    });

    const stageExpirationField = useFormField<
        StageInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.stageExpiration`
    >(`${basePath}.stageExpiration`, {
        label: t('app.governance.createProcessForm.stage.timing.dialog.expiration.label'),
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

    const bodyThresholdField = useFormField<
        StageInputItemBaseForm,
        `${typeof stageName}.${typeof stageIndex}.bodyThreshold`
    >(`${basePath}.bodyThreshold`, {
        defaultValue: 1,
    });

    return {
        stageNameField,
        stageTypeField,
        votingPeriodField,
        earlyStageField,
        stageExpirationField,
        stageExpirationPeriodField,
        bodyThresholdField,
    };
};
