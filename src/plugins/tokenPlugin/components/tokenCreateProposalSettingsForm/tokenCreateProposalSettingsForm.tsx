import { useDaoSettings } from '@/shared/api/daoService';
import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { convertSecondsToDaysHoursMinutes } from '@/shared/utils/createProposalUtils';
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

    const minDuration = dao?.settings.minDuration;

    const startTime = useWatch({ name: 'startTimeFixed' });

    const { days, hours, minutes } = convertSecondsToDaysHoursMinutes(minDuration ?? 0);

    return (
        <>
            <AdvancedDateInput
                label={t('app.plugins.token.createProposalSettingsForm.startTime.label')}
                field={t('app.plugins.token.createProposalSettingsForm.startTime.field')}
                helpText={t('app.plugins.token.createProposalSettingsForm.startTime.helpText')}
                isStartField={true}
            />
            <AdvancedDateInput
                label={t('app.plugins.token.createProposalSettingsForm.endTime.label')}
                field={t('app.plugins.token.createProposalSettingsForm.endTime.field')}
                helpText={t('app.plugins.token.createProposalSettingsForm.endTime.helpText')}
                infoText={t('app.plugins.token.createProposalSettingsForm.endTime.infoText', {
                    days,
                    hours,
                    minutes,
                })}
                useDuration={true}
                minDuration={minDuration ?? 0}
                startTime={startTime}
            />
        </>
    );
};
