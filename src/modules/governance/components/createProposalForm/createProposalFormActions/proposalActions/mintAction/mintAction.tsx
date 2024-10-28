import type { IProposalAction } from '@/modules/governance/api/governanceService';
import {
    AddressInput,
    addressUtils,
    type ICompositeAddress,
    InputNumber,
    type IProposalActionComponentProps,
} from '@aragon/gov-ui-kit';
import type { IProposalActionData } from '../../../createProposalFormDefinitions';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { useState } from 'react';

export interface IMintActionProps extends IProposalActionComponentProps<IProposalActionData<IProposalAction>> {}

export interface IMintFormData {
    /**
     * The address receiving the tokens.
     */
    receiver?: ICompositeAddress;
    /**
     * The amount of tokens to be sent.
     */
    amount?: string;
}

export const MintAction: React.FC<IMintActionProps> = (props) => {
    const { action, index } = props;

    const { t } = useTranslations();

    const fieldName = `actions.[${index}]`;
    useFormField<Record<string, IProposalActionData>, typeof fieldName>(fieldName);

    const {
        onChange: onReceiverChange,
        value,
        ...receiverField
    } = useFormField<IMintFormData, 'receiver'>('receiver', {
        label: t('app.finance.transferAssetForm.receiver.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        fieldPrefix: fieldName,
    });

    const [receiverInput, setReceiverInput] = useState<string | undefined>(value?.address);

    const amountField = useFormField<IMintFormData, 'amount'>('amount', {
        label: t('app.finance.transferAssetForm.amount.label'),
        rules: { required: true },
        fieldPrefix: fieldName,
    });

    return (
        <div className="flex w-full flex-col gap-6">
            <AddressInput
                helpText={t('app.finance.transferAssetForm.receiver.helpText')}
                placeholder={t('app.finance.transferAssetForm.receiver.placeholder')}
                chainId={1}
                value={receiverInput}
                onChange={setReceiverInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <InputNumber {...amountField} />
        </div>
    );
};
