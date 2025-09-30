import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenDelegationDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenDelegationDialog';
import { useTokenCurrentDelegate } from '@/plugins/tokenPlugin/hooks/useTokenCurrentDelegate';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    AddressInput,
    addressUtils,
    Button,
    RadioCard,
    RadioGroup,
    type IAddressInputResolvedValue,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import {
    TokenDelegationSelection,
    type ITokenDelegationFormData,
    type ITokenDelegationFormProps,
} from './tokenDelegationForm.api';

export const TokenDelegationForm: React.FC<ITokenDelegationFormProps> = (props) => {
    const { plugin, daoId } = props;

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { data: currentDelegate, isLoading: isCurrentDelegateLoading } = useTokenCurrentDelegate({
        userAddress: address,
        tokenAddress: plugin.settings.token.address,
        network: dao!.network,
    });

    const defaultValues: ITokenDelegationFormData = useMemo(() => {
        const isSelfDelegate = addressUtils.isAddressEqual(address, currentDelegate ?? undefined);
        const defaultDelegate = currentDelegate ?? undefined;

        return {
            selection: isSelfDelegate ? TokenDelegationSelection.YOURSELF : TokenDelegationSelection.OTHER,
            delegate: defaultDelegate,
        };
    }, [address, currentDelegate]);

    const { handleSubmit, reset, control } = useForm<ITokenDelegationFormData>({
        mode: 'onTouched',
        defaultValues,
    });
    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const {
        onChange: onSelectionChange,
        value: selectionValue,
        ...selectionField
    } = useFormField<ITokenDelegationFormData, 'selection'>('selection', {
        label: t('app.plugins.token.tokenDelegationForm.selection.label'),
        rules: { required: true },
        control,
    });

    const [delegateInput, setDelegateInput] = useState<string | undefined>();
    const {
        onChange: onDelegateChange,
        value: delegate,
        ...delegateField
    } = useFormField<ITokenDelegationFormData, 'delegate'>('delegate', {
        label: t('app.plugins.token.tokenDelegationForm.delegate.label'),
        rules: { required: true, validate: (value) => addressUtils.isAddress(value) },
        control,
    });

    const handleSelectionChange = (value: string) => {
        const newDelegateInput = value === TokenDelegationSelection.YOURSELF ? address : currentDelegate;
        setDelegateInput(newDelegateInput ?? undefined);
        onSelectionChange(value);
    };

    const handleDelegateChange = (value?: IAddressInputResolvedValue) => onDelegateChange(value?.address);

    const handleFormSubmit = () => {
        const params: ITokenDelegationDialogParams = {
            token: plugin.settings.token.address,
            delegate,
            network: dao!.network,
        };
        open(TokenPluginDialogId.DELEGATE, { params });
    };

    // Update form initial data on user address / backend data update
    useEffect(() => {
        reset(defaultValues);
        setDelegateInput(defaultValues.delegate);
    }, [reset, defaultValues]);

    const isDelegateUnchanged = useMemo(
        () => addressUtils.isAddressEqual(delegate, currentDelegate ?? undefined),
        [delegate, currentDelegate],
    );

    // disable submit button if delegate address has not been changed, but also, disable while isMemberLoading to prevent
    // multiple button state changes during page refresh
    const isSubmitDisabled = isCurrentDelegateLoading || isDelegateUnchanged;

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <RadioGroup onValueChange={handleSelectionChange} value={selectionValue} {...selectionField}>
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
                value={delegateInput}
                onChange={setDelegateInput}
                onAccept={handleDelegateChange}
                disabled={selectionValue === TokenDelegationSelection.YOURSELF}
                {...delegateField}
            />
            <div className="flex flex-col gap-3">
                <Button
                    type={isConnected ? 'submit' : undefined}
                    onClick={isConnected ? undefined : () => walletGuard()}
                    disabled={isSubmitDisabled}
                >
                    {t('app.plugins.token.tokenDelegationForm.submit')}
                </Button>
                <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                    {t('app.plugins.token.tokenDelegationForm.info')}
                </p>
            </div>
        </form>
    );
};
