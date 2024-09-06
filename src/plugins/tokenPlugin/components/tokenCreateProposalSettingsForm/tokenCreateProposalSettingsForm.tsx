import { type ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import { useDaoSettings } from '@/shared/api/daoService';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { dateUtils } from '@/shared/utils/createProposalUtils/dateUtils';
import { DateTime } from 'luxon';
import { useWatch } from 'react-hook-form';
import { type IDaoTokenSettings } from '../../types';

export interface ITokenCreateProposalSettingsFormProps {
    /**
     * The DAO ID.
     */
    daoId: string;
}

export const TokenCreateProposalSettingsForm: React.FC<ITokenCreateProposalSettingsFormProps> = ({ daoId }) => {
    const daoSettingsParams = { daoId };
    const { data: dao } = useDaoSettings<IDaoTokenSettings>({ urlParams: daoSettingsParams });

    const { t } = useTranslations();

    const startTimeFixed = useWatch<ICreateProposalFormData, 'startTimeFixed'>({ name: 'startTimeFixed' });

    const minDuration = dao?.settings.minDuration ?? 0;
    const parsedMinDuration = dateUtils.secondsToDaysHoursMinutes(minDuration);
    const { days, hours, minutes } = parsedMinDuration;

    const minEndTime = startTimeFixed ? dateUtils.parseFixedDate(startTimeFixed) : DateTime.now();

    // Add min duration to the form values for later use
    useFormField<ICreateProposalFormData, 'minimumDuration'>('minimumDuration', { defaultValue: parsedMinDuration });

    return (
        <>
            <AdvancedDateInput
                label={t('app.plugins.token.tokenCreateProposalSettingsForm.startTime.label')}
                field="startTime"
                helpText={t('app.plugins.token.tokenCreateProposalSettingsForm.startTime.helpText')}
                minTime={DateTime.now()}
            />
            <AdvancedDateInput
                label={t('app.plugins.token.tokenCreateProposalSettingsForm.endTime.label')}
                field="endTime"
                helpText={t('app.plugins.token.tokenCreateProposalSettingsForm.endTime.helpText')}
                infoText={t('app.plugins.token.tokenCreateProposalSettingsForm.endTime.infoText', {
                    days,
                    hours,
                    minutes,
                })}
                useDuration={true}
                minDuration={parsedMinDuration}
                minTime={minEndTime}
                validateMinDuration={true}
            />
        </>
    );
};
