'use client';

import { DateTime } from 'luxon';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';

export type ISppCreateProposalSettingsFormProps = Record<string, never>;

export const SppCreateProposalSettingsForm: React.FC<ISppCreateProposalSettingsFormProps> = () => {
    const { t } = useTranslations();

    return (
        <AdvancedDateInput
            field="startTime"
            helpText={t('app.plugins.spp.sppCreateProposalSettingsForm.startTime.helpText')}
            label={t('app.plugins.spp.sppCreateProposalSettingsForm.startTime.label')}
            minTime={DateTime.now()}
        />
    );
};
