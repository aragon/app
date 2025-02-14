import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, Button, type ICompositeAddress, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export interface ITokenDelegationFormData {
    /**
     * Current selection for the delegate.
     */
    selection: 'yourself' | 'other';
    /**
     * Address to delegate the voting power to.
     */
    delegate?: ICompositeAddress;
}

export interface ITokenDelegationFormProps {
    /**
     * Callback triggered on form submit.
     */
    onSubmit: (values: ITokenDelegationFormData) => void;
}

export const TokenDelegationForm: React.FC<ITokenDelegationFormProps> = (props) => {
    const { onSubmit } = props;

    const { t } = useTranslations();
    const { handleSubmit, control } = useForm<ITokenDelegationFormData>({ mode: 'onTouched' });

    const { onChange: onSelectionChange, ...selectionField } = useFormField<ITokenDelegationFormData, 'selection'>(
        'selection',
        { rules: { required: true }, control },
    );

    const [delegateInput, setDelegateInput] = useState<string | undefined>();

    const {
        onChange: onReceiverChange,
        value,
        ...receiverField
    } = useFormField<ITokenDelegationFormData, 'delegate'>('delegate', {
        label: t('app.plugins.token.tokenDelegationForm.delegate.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value?.address) },
        control,
    });

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <RadioGroup onValueChange={onSelectionChange} {...selectionField}>
                <RadioCard value="yourself" label={t('app.plugins.token.tokenDelegationForm.selection.option.self')} />
                <RadioCard value="other" label={t('app.plugins.token.tokenDelegationForm.selection.option.other')} />
            </RadioGroup>
            <AddressInput
                helpText={t('app.plugins.token.tokenDelegationForm.delegate.helpText')}
                placeholder={t('app.plugins.token.tokenDelegationForm.delegate.placeholder')}
                chainId={1}
                value={delegateInput}
                onChange={setDelegateInput}
                onAccept={onReceiverChange}
                {...receiverField}
            />
            <div className="flex flex-col gap-3">
                <Button type="submit">{t('app.plugins.token.tokenDelegationForm.submit')}</Button>
            </div>
        </form>
    );
};
