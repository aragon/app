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
                label={t('app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.label')}
                helpText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.helpText')}
                field="startTime"
                isStartField={true}
            />
            <AdvancedDateInput
                label={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.label')}
                helpText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.helpText')}
                field="endTime"
                infoText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.infoText')}
                useDuration={true}
                startTime={startTime}
            />
        </>
    );
};
