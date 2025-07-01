import { WizardDialog } from '@/shared/components/wizards/wizardDialog';
import { useFormField } from '@/shared/hooks/useFormField';
import { InputText } from '@aragon/gov-ui-kit';
import type { ICapitalDistributorClaimDialogForm } from '../capitalDistributorClaimDialogDefinitions';

export interface ICapitalDistributorClaimDialogInputsProps {}

export const CapitalDistributorClaimDialogInputs: React.FC<ICapitalDistributorClaimDialogInputsProps> = () => {
    const recipientField = useFormField<ICapitalDistributorClaimDialogForm, 'recipient'>('recipient', {
        label: 'Recipient',
        rules: { required: true },
    });

    return (
        <WizardDialog.Step id="claim" order={2} meta={{ name: '' }}>
            <InputText helpText="The address to get the payout" {...recipientField} />
        </WizardDialog.Step>
    );
};
