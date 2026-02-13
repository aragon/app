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

const recommendedMinDays = 1;

export const CapitalDistributorCampaignScheduleField: React.FC<
    ICapitalDistributorCampaignScheduleFieldProps
> = (props) => {
    const { fieldPrefix } = props;
    const { t } = useTranslations();
    const { setValue } = useFormContext();

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

    const startTimeFixed = useWatch({
        name: `${fieldPrefix}.startTimeFixed`,
    });

    const minEndTime = startTimeFixed
        ? dateUtils.parseFixedDate(startTimeFixed)
        : DateTime.now();

    const handleScheduleTypeChange = (value: string) => {
        onScheduleTypeChange(value);

        if (value === CampaignScheduleType.OPEN_ENDED) {
            setValue(`${fieldPrefix}.startTimeMode`, undefined, {
                shouldValidate: true,
            });
            setValue(`${fieldPrefix}.startTimeFixed`, undefined, {
                shouldValidate: true,
            });
            setValue(`${fieldPrefix}.endTimeMode`, undefined, {
                shouldValidate: true,
            });
            setValue(`${fieldPrefix}.endTimeDuration`, undefined, {
                shouldValidate: true,
            });
            setValue(`${fieldPrefix}.endTimeFixed`, undefined, {
                shouldValidate: true,
            });
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
                            days: recommendedMinDays,
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
