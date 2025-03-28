import { CheckboxCard } from '@aragon/gov-ui-kit';
import type { IMultisigProposalCreationSettingsProps } from './multisigProposalCreationSettings.api';
import { useFormField } from '@/shared/hooks/useFormField';
import { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';

export const MultisigProposalCreationSettings: React.FC<IMultisigProposalCreationSettingsProps> = (props) => {
    const { body, onChange, checked } = props;
    const { name, description, internalId } = body;

    const onlyListedField = useFormField<ISetupBodyForm>('onlyListed', {
        fieldPrefix:
    });

    const handleChange = () => {...}

    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={(isChecked) => onChange(internalId, Boolean(isChecked))}
            checked={checked}
        />
    );
};
