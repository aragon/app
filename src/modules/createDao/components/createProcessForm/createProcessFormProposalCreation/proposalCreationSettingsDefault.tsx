'use client';

import { addressUtils, CheckboxCard, type CheckboxState } from '@aragon/gov-ui-kit';
import safeWallet from '@/assets/images/safeWallet.png';
import type { ISetupBodyForm } from '@/modules/createDao/dialogs/setupBodyDialog';
import type { IPluginProposalCreationSettingsParams } from '@/modules/createDao/types';
import { useFormField } from '@/shared/hooks/useFormField';
import { BodyType } from '../../../types/enum';
import { createProcessFormUtils } from '../createProcessFormUtils';

export interface IProposalCreationSettingsDefaultProps extends IPluginProposalCreationSettingsParams {}

export const ProposalCreationSettingsDefault: React.FC<IProposalCreationSettingsDefaultProps> = (props) => {
    const { formPrefix, disableCheckbox } = props;
    const body = props.body as ISetupBodyForm;
    const isExternal = body.type === BodyType.EXTERNAL;

    const name = isExternal ? addressUtils.truncateAddress(body.address) : (body.name ?? '');
    const description = isExternal ? (body.isSafe ? 'Safe{Wallet}' : undefined) : body.description;

    const { value: canCreateProposal, onChange: onCreateProposalChange } = useFormField<ISetupBodyForm, 'canCreateProposal'>(
        'canCreateProposal',
        { fieldPrefix: formPrefix, defaultValue: true }
    );

    const handleCheckedChange = (checked: CheckboxState) => {
        if (!disableCheckbox) {
            onCreateProposalChange(checked === true);
        }
    };

    return (
        <CheckboxCard
            avatar={createProcessFormUtils.isBodySafe(body) ? safeWallet.src : undefined}
            checked={canCreateProposal}
            className="w-full"
            description={description}
            label={name}
            onCheckedChange={handleCheckedChange}
        />
    );
};
