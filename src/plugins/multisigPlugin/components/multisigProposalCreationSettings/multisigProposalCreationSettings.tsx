import { ProposalCreationMode } from '@/modules/createDao/components/createProcessForm';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginProposalCreationSettingsParams } from '@/modules/createDao/types';
import { useFormField } from '@/shared/hooks/useFormField';
import { CheckboxCard, type CheckboxState } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import type { IMultisigSetupGovernanceForm } from '../multisigSetupGovernance';

export interface IMultisigProposalCreationSettingsProps extends IPluginProposalCreationSettingsParams {}

export const MultisigProposalCreationSettings: React.FC<IMultisigProposalCreationSettingsProps> = (props) => {
    const { body, formPrefix, mode } = props;
    const { name, description } = body;

    const { onChange: onCreateProposalChange } = useFormField<ISetupBodyForm, 'canCreateProposal'>(
        'canCreateProposal',
        { fieldPrefix: formPrefix },
    );

    const { onChange: onOnlyListedChange, value: onlyListed } = useFormField<
        IMultisigSetupGovernanceForm,
        'onlyListed'
    >('onlyListed', { fieldPrefix: `${formPrefix}.governance`, defaultValue: false });

    const handleCheckedChange = (checked: CheckboxState) => onOnlyListedChange(checked === false);

    // Update the onlyListed parameter when user selects "anyone" button as proposal creation setting.
    useEffect(() => {
        if (mode === ProposalCreationMode.ANY_WALLET) {
            onOnlyListedChange(false);
        }
    }, [mode, onOnlyListedChange]);

    useEffect(() => {
        onCreateProposalChange(!onlyListed);
    }, [onlyListed, onCreateProposalChange]);

    return (
        <CheckboxCard
            label={name}
            description={description}
            onCheckedChange={handleCheckedChange}
            checked={!onlyListed}
        />
    );
};
