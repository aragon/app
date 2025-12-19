'use client';

import { DateTime } from 'luxon';
import { useWatch } from 'react-hook-form';
import type { ICreateProposalEndDateForm } from '@/modules/governance/utils/createProposalUtils';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dateUtils } from '@/shared/utils/dateUtils';

export interface IMultisigCreateProposalSettingsFormProps {}

const recommendedMinDays = 5;

export const MultisigCreateProposalSettingsForm: React.FC<
    IMultisigCreateProposalSettingsFormProps
> = () => {
    const { t } = useTranslations();

    const startTimeFixed = useWatch<
        ICreateProposalEndDateForm,
        'startTimeFixed'
    >({ name: 'startTimeFixed' });
    const minEndTime = startTimeFixed
        ? dateUtils.parseFixedDate(startTimeFixed)
        : DateTime.now();

    return (
        <div className="flex flex-col gap-6 md:gap-12">
            <AdvancedDateInput
                field="startTime"
                helpText={t(
                    'app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.helpText',
                )}
                label={t(
                    'app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.label',
                )}
                minTime={DateTime.now()}
            />
            <AdvancedDateInput
                field="endTime"
                helpText={t(
                    'app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.helpText',
                )}
                infoText={t(
                    'app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.infoText',
                    {
                        days: recommendedMinDays,
                    },
                )}
                label={t(
                    'app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.label',
                )}
                minDuration={{ days: recommendedMinDays, hours: 0, minutes: 0 }}
                minTime={minEndTime}
                useDuration={true}
            />
        </div>
    );
};
