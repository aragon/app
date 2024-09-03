import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useWatch } from 'react-hook-form';

export interface IMultisigCreateProposalSettingsFormProps {}

export const MultisigCreateProposalSettingsForm: React.FC<IMultisigCreateProposalSettingsFormProps> = () => {
    const { t } = useTranslations();

    const startTime = useWatch({ name: 'startTimeFixed' });

    return (
        <>
            <AdvancedDateInput
                label={t('app.plugins.multisig.createProposalSettingsForm.startTime.label')}
                helpText={t('app.plugins.multisig.createProposalSettingsForm.startTime.helpText')}
                field={t('app.plugins.multisig.createProposalSettingsForm.startTime.field')}
                isStartField={true}
            />
            <AdvancedDateInput
                label={t('app.plugins.multisig.createProposalSettingsForm.endTime.label')}
                helpText={t('app.plugins.multisig.createProposalSettingsForm.endTime.helpText')}
                field={t('app.plugins.multisig.createProposalSettingsForm.endTime.field')}
                infoText={t('app.plugins.multisig.createProposalSettingsForm.endTime.infoText')}
                useDuration={true}
                startTime={startTime}
            />
        </>
    );
};
