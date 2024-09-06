import { type ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import { AdvancedDateInput } from '@/shared/components/advancedDateInput';
import { AdvancedDateInputFields } from '@/shared/components/advancedDateInput/advancedInput.api';
import { useTranslations } from '@/shared/components/translationsProvider';
import { DateTime } from 'luxon';
import { useWatch } from 'react-hook-form';

export interface IMultisigCreateProposalSettingsFormProps {}

export const MultisigCreateProposalSettingsForm: React.FC<IMultisigCreateProposalSettingsFormProps> = () => {
    const { t } = useTranslations();

    const startTimeFixed = useWatch<ICreateProposalFormData, 'startTimeFixed'>({ name: 'startTimeFixed' });
    const minEndTime = startTimeFixed
        ? DateTime.fromFormat(`${startTimeFixed.date} ${startTimeFixed.time}`, 'yyyy-MM-dd HH:mm')
        : DateTime.now();

    return (
        <>
            <AdvancedDateInput
                label={t('app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.label')}
                helpText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.helpText')}
                field={AdvancedDateInputFields.START_TIME}
                minTime={DateTime.now()}
            />
            <AdvancedDateInput
                label={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.label')}
                helpText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.helpText')}
                field={AdvancedDateInputFields.END_TIME}
                infoText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.infoText')}
                useDuration={true}
                minTime={minEndTime}
            />
        </>
    );
};
