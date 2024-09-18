import { type ICreateProposalFormData } from '@/modules/governance/components/createProposalForm';
import { AdvancedDateInput } from '@/shared/components/forms/advancedDateInput';
import { useTranslations } from '@/shared/components/translationsProvider';
import { dateUtils } from '@/shared/utils/dateUtils';
import { DateTime } from 'luxon';
import { useWatch } from 'react-hook-form';

export interface IMultisigCreateProposalSettingsFormProps {}

const recommendedMinDays = 5;

export const MultisigCreateProposalSettingsForm: React.FC<IMultisigCreateProposalSettingsFormProps> = () => {
    const { t } = useTranslations();

    const startTimeFixed = useWatch<ICreateProposalFormData, 'startTimeFixed'>({ name: 'startTimeFixed' });
    const minEndTime = startTimeFixed ? dateUtils.parseFixedDate(startTimeFixed) : DateTime.now();

    return (
        <>
            <AdvancedDateInput
                label={t('app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.label')}
                helpText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.startTime.helpText')}
                field="startTime"
                minTime={DateTime.now()}
            />
            <AdvancedDateInput
                label={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.label')}
                helpText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.helpText')}
                field="endTime"
                infoText={t('app.plugins.multisig.multisigCreateProposalSettingsForm.endTime.infoText', {
                    days: recommendedMinDays,
                })}
                useDuration={true}
                minTime={minEndTime}
                minDuration={{ days: recommendedMinDays, hours: 0, minutes: 0 }}
            />
        </>
    );
};
