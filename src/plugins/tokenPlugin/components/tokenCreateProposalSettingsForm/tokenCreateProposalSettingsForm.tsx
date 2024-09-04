import { useDaoSettings } from '@/shared/api/daoService';
import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dateUtils } from '@/shared/utils/createProposalUtils/dateUtils';
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

    const minDuration = dao?.settings.minDuration ?? 0;

    const { days, hours, minutes } = dateUtils.secondsToDaysHoursMinutes(minDuration);

    return (
        <>
            <AdvancedDateInput
                label={t('app.plugins.token.tokenCreateProposalSettingsForm.startTime.label')}
                field="startTime"
                helpText={t('app.plugins.token.tokenCreateProposalSettingsForm.startTime.helpText')}
                isStartField={true}
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
                minDuration={minDuration}
            />
        </>
    );
};
