import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useMember } from '@/modules/governance/api/governanceService';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { AddressInput, addressUtils, Button, type ICompositeAddress, RadioCard, RadioGroup } from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import type { ITokenMember, ITokenPluginSettings } from '../../types';

export enum TokenDelegationSelection {
    YOURSELF = 'YOURSELF',
    OTHER = 'OTHER',
}

export interface ITokenDelegationFormData {
    /**
     * Current selection for the delegate.
     */
    selection: TokenDelegationSelection;
    /**
     * Address to delegate the voting power to.
     */
    delegate?: ICompositeAddress;
}

export interface ITokenDelegationFormProps {
    /**
     * DAO plugin for the token delegation.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Callback triggered on form submit.
     */
    onSubmit: (values: ITokenDelegationFormData) => void;
}

export const TokenDelegationForm: React.FC<ITokenDelegationFormProps> = (props) => {
    const { plugin, daoId, onSubmit } = props;

    const { t } = useTranslations();
    const { address } = useAccount();

    const { data: tokenMember } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const defaultValues: ITokenDelegationFormData = useMemo(() => {
        const isSelfDelegate = addressUtils.isAddressEqual(address, tokenMember?.delegate ?? undefined);
        const defaultDelegate = tokenMember?.delegate != null ? { address: tokenMember.delegate } : undefined;

        return {
            selection: isSelfDelegate ? TokenDelegationSelection.YOURSELF : TokenDelegationSelection.OTHER,
            delegate: defaultDelegate,
        };
    }, [address, tokenMember]);

    const { handleSubmit, reset, control, formState } = useForm<ITokenDelegationFormData>({
        mode: 'onTouched',
        defaultValues,
    });
    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

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

    const handleSelectionChange = (value: string) => {
        const newDelegateInput = value === TokenDelegationSelection.YOURSELF ? address : tokenMember?.delegate;
        setDelegateInput(newDelegateInput ?? undefined);
        onSelectionChange(value);
    };

    // Update form initial data on user address / backend data update
    useEffect(() => {
        reset(defaultValues);
        setDelegateInput(defaultValues.delegate?.address);
    }, [reset, defaultValues]);

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <RadioGroup onValueChange={handleSelectionChange} {...selectionField}>
                <RadioCard
                    value={TokenDelegationSelection.YOURSELF}
                    label={t('app.plugins.token.tokenDelegationForm.selection.option.self')}
                />
                <RadioCard
                    value={TokenDelegationSelection.OTHER}
                    label={t('app.plugins.token.tokenDelegationForm.selection.option.other')}
                />
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
                <Button
                    type={isConnected ? 'submit' : undefined}
                    onClick={isConnected ? undefined : () => walletGuard()}
                    disabled={!formState.isDirty}
                >
                    {t('app.plugins.token.tokenDelegationForm.submit')}
                </Button>
                <p className="text-center text-sm font-normal leading-normal text-neutral-500">
                    {t('app.plugins.token.tokenDelegationForm.info')}
                </p>
            </div>
        </form>
    );
};
