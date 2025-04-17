import { ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginProposalCreationSettingsParams } from '@/modules/createDao/types';
import { useFormField } from '@/shared/hooks/useFormField';
import { CheckboxCard, type CheckboxState } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { IMultisigSetupGovernanceForm } from '../multisigSetupGovernance';

export interface IMultisigProposalCreationSettingsProps extends IPluginProposalCreationSettingsParams {}

export const MultisigProposalCreationSettings: React.FC<IMultisigProposalCreationSettingsProps> = (props) => {
    const { body, formPrefix, mode, disableCheckbox } = props;
    const { name, description } = body;

    const { value: canCreateProposal, onChange: onCreateProposalChange } = useFormField<
        ISetupBodyForm,
        'canCreateProposal'
    >('canCreateProposal', { fieldPrefix: formPrefix, defaultValue: true });

    const { onChange: onOnlyListedChange } = useFormField<IMultisigSetupGovernanceForm, 'onlyListed'>('onlyListed', {
        fieldPrefix: `${formPrefix}.governance`,
        defaultValue: true,
    });

    const handleCheckedChange = (checked: CheckboxState) => {
        if (!disableCheckbox) {
            onCreateProposalChange(checked === true);
        }
    };

    useEffect(() => {
        const onlyListed = mode !== ProposalCreationMode.ANY_WALLET && canCreateProposal;
        onOnlyListedChange(onlyListed);
    }, [mode, canCreateProposal, onOnlyListedChange]);

    const checked = canCreateProposal;

    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={handleCheckedChange}
            checked={checked}
            className="w-full"
        />
    );
};
