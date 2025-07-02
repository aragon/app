import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { addressUtils, InputText } from '@aragon/gov-ui-kit';
import type { ICapitalDistributorClaimDialogForm } from '../capitalDistributorClaimDialogDefinitions';

export interface ICapitalDistributorClaimDialogInputsProps {}

export const CapitalDistributorClaimDialogInputs: React.FC<ICapitalDistributorClaimDialogInputsProps> = () => {
    const { t } = useTranslations();

    const recipientField = useFormField<ICapitalDistributorClaimDialogForm, 'recipient'>('recipient', {
        label: t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.recipient'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
    });

    return (
        <InputText
            helpText={t('app.plugins.capitalDistributor.capitalDistributorClaimDialog.inputs.helpText')}
            {...recipientField}
        />
    );
};
