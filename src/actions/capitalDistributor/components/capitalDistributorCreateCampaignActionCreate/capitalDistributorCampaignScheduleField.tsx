'use client';

import { RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { useFormContext, useWatch } from 'react-hook-form';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/dateUtils';
import {
    CampaignScheduleType,
    type ICapitalDistributorCreateCampaignFormData,
} from './capitalDistributorCreateCampaignActionCreateForm';

export interface ICapitalDistributorCampaignScheduleFieldProps {
    /**
     * Prefix for form fields.
     */
    fieldPrefix: string;
}

export const CapitalDistributorCampaignScheduleField: React.FC<
    ICapitalDistributorCampaignScheduleFieldProps
> = (props) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();
    const { resetField } = useFormContext();

    const { onChange: onScheduleTypeChange, ...scheduleTypeField } =
        useFormField<ICapitalDistributorCreateCampaignFormData, 'scheduleType'>(
            'scheduleType',
            {
                fieldPrefix,
                label: t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.label',
                ),
                defaultValue: CampaignScheduleType.OPEN_ENDED,
            },
        );

    const scheduleType = useWatch({
        name: `${fieldPrefix}.scheduleType`,
    }) as CampaignScheduleType | undefined;

    const startTimeMode = useWatch({
        name: `${fieldPrefix}.startTimeMode`,
    }) as string | undefined;

    const startTimeFixed = useWatch({
        name: `${fieldPrefix}.startTimeFixed`,
    });

    const minEndTime =
        startTimeMode === 'fixed' && startTimeFixed
            ? dateUtils.parseFixedDate(startTimeFixed)
            : DateTime.now();

    const handleScheduleTypeChange = (value: string) => {
        onScheduleTypeChange(value);

        if (value === CampaignScheduleType.OPEN_ENDED) {
            const fields = [
                `${fieldPrefix}.startTimeMode`,
                `${fieldPrefix}.startTimeFixed`,
                `${fieldPrefix}.endTimeMode`,
                `${fieldPrefix}.endTimeDuration`,
                `${fieldPrefix}.endTimeFixed`,
            ] as const;

            fields.forEach((name) =>
                resetField(name, { defaultValue: undefined }),
            );
        }
    };

    return (
        <>
            <RadioGroup
                className="flex w-full gap-4 md:flex-row!"
                helpText={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.helpText',
                )}
                label={t(
                    'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.label',
                )}
                onValueChange={handleScheduleTypeChange}
                {...scheduleTypeField}
            >
                <RadioCard
                    description={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.openEnded.description',
                    )}
                    label={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.openEnded.label',
                    )}
                    value={CampaignScheduleType.OPEN_ENDED}
                />
                <RadioCard
                    description={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.scheduled.description',
                    )}
                    label={t(
                        'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.scheduled.label',
                    )}
                    value={CampaignScheduleType.SCHEDULED}
                />
            </RadioGroup>

            {scheduleType === CampaignScheduleType.SCHEDULED && (
                <div className="flex flex-col gap-6">
                    <AdvancedDateInput
                        field={`${fieldPrefix}.startTime`}
                        helpText={t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.startTime.helpText',
                        )}
                        label={t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.startTime.label',
                        )}
                        minTime={DateTime.now()}
                    />
                    <AdvancedDateInput
                        field={`${fieldPrefix}.endTime`}
                        helpText={t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.endTime.helpText',
                        )}
                        label={t(
                            'app.actions.capitalDistributor.capitalDistributorCreateCampaignActionCreateForm.schedule.endTime.label',
                        )}
                        minDuration={{
                            days: 14,
                            hours: 0,
                            minutes: 0,
                        }}
                        minTime={minEndTime}
                        useDuration={true}
                    />
                </div>
            )}
        </>
    );
};
