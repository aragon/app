import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DateTime } from 'luxon';

export interface ISppCreateProposalSettingsFormProps {}

export const SppCreateProposalSettingsForm: React.FC<ISppCreateProposalSettingsFormProps> = () => {
    const { t } = useTranslations();

    return (
        <AdvancedDateInput
            label={t('app.plugins.spp.sppCreateProposalSettingsForm.startTime.label')}
            field="startTime"
            helpText={t('app.plugins.spp.sppCreateProposalSettingsForm.startTime.helpText')}
            minTime={DateTime.now()}
        />
    );
};
