'use client';

import { DateTime } from 'luxon';
import { useWatch } from 'react-hook-form';
import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/dateUtils/dateUtils';
import type { ITokenPluginSettings } from '../../types';

export interface ITokenCreateProposalSettingsFormProps {
    /**
     * Plugin to create the proposal for.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
}

export const TokenCreateProposalSettingsForm: React.FC<
    ITokenCreateProposalSettingsFormProps
> = (props) => {
    const { plugin } = props;

    const { t } = useTranslations();

    const startTimeFixed = useWatch<
        ICreateProposalEndDateForm,
        'startTimeFixed'
    >({ name: 'startTimeFixed' });

    const minDuration = plugin.settings.minDuration;
    const parsedMinDuration = dateUtils.secondsToDuration(minDuration);
    const { days, hours, minutes } = parsedMinDuration;

    const minEndTime = startTimeFixed
        ? dateUtils.parseFixedDate(startTimeFixed)
        : DateTime.now();

    // Add min duration to the form values for later use
    useFormField<ICreateProposalEndDateForm, 'minimumDuration'>(
        'minimumDuration',
        { defaultValue: parsedMinDuration },
    );

    return (
        <div className="flex flex-col gap-6 md:gap-12">
            <AdvancedDateInput
                field="startTime"
                label={t(
                    'app.plugins.token.tokenCreateProposalSettingsForm.startTime.label',
                )}
                minTime={DateTime.now()}
            />
            <AdvancedDateInput
                field="endTime"
                infoText={t(
                    'app.plugins.token.tokenCreateProposalSettingsForm.endTime.infoText',
                    {
                        days,
                        hours,
                        minutes,
                    },
                )}
                label={t(
                    'app.plugins.token.tokenCreateProposalSettingsForm.endTime.label',
                )}
                minDuration={parsedMinDuration}
                minTime={minEndTime}
                useDuration={true}
                validateMinDuration={true}
            />
        </div>
    );
};
