import {
    AddressInput,
    addressUtils,
    Button,
    type IAddressInputResolvedValue,
    IconType,
    RadioCard,
    RadioGroup,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zeroAddress } from 'viem';
import { useConnection } from 'wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenDelegationDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenDelegationDialog';
import { useTokenCurrentDelegate } from '@/plugins/tokenPlugin/hooks/useTokenCurrentDelegate';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { FooterInfo } from '@/shared/components/footerInfo';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    type ITokenDelegationFormData,
    type ITokenDelegationFormProps,
    TokenDelegationSelection,
} from './tokenDelegationForm.api';

export const TokenDelegationForm: React.FC<ITokenDelegationFormProps> = (
    props,
) => {
    const {
        tokenAddress,
        daoId,
        mode = 'panel',
        onCancel,
        initialDelegateAddress,
    } = props;

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useConnection();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { chainId } = useDaoChain({ daoId });

    const { data: currentDelegate, isLoading: isCurrentDelegateLoading } =
        useTokenCurrentDelegate({
            userAddress: address,
            tokenAddress,
            network: dao!.network,
        });

    const defaultValues: ITokenDelegationFormData = useMemo(() => {
        if (initialDelegateAddress != null) {
            return {
                selection: TokenDelegationSelection.OTHER,
                delegate: initialDelegateAddress,
            };
        }

        const hasExistingDelegate =
            currentDelegate != null &&
            !addressUtils.isAddressEqual(currentDelegate, zeroAddress);
        const isSelfDelegate = addressUtils.isAddressEqual(
            address,
            currentDelegate ?? undefined,
        );
        const defaultDelegate = hasExistingDelegate
            ? currentDelegate
            : (address ?? undefined);

        return {
            selection:
                isSelfDelegate || !hasExistingDelegate
                    ? TokenDelegationSelection.YOURSELF
                    : TokenDelegationSelection.OTHER,
            delegate: defaultDelegate,
        };
    }, [address, currentDelegate, initialDelegateAddress]);

    const { handleSubmit, reset, control } = useForm<ITokenDelegationFormData>({
        mode: 'onTouched',
        defaultValues,
    });
    const { result: isConnected, check: walletGuard } =
        useConnectedWalletGuard();

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
        rules: {
            required: true,
            validate: (value) => addressUtils.isAddress(value),
        },
        control,
        sanitizeOnBlur: false,
    });

    const handleSelectionChange = (value: string) => {
        const hasExistingDelegate =
            currentDelegate != null &&
            !addressUtils.isAddressEqual(currentDelegate, zeroAddress);
        const newDelegateInput =
            value === TokenDelegationSelection.YOURSELF
                ? address
                : hasExistingDelegate
                  ? currentDelegate
                  : undefined;
        setDelegateInput(newDelegateInput ?? undefined);
        onSelectionChange(value);
    };

    const handleDelegateChange = (value?: IAddressInputResolvedValue) =>
        onDelegateChange(value?.address);

    const handleFormSubmit = () => {
        const params: ITokenDelegationDialogParams = {
            token: tokenAddress,
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
        () =>
            addressUtils.isAddressEqual(delegate, currentDelegate ?? undefined),
        [delegate, currentDelegate],
    );

    // disable submit button if delegate address has not been changed, but also, disable while isMemberLoading to prevent
    // multiple button state changes during page refresh
    const isSubmitDisabled = isCurrentDelegateLoading || isDelegateUnchanged;

    const footerInfo = (
        <FooterInfo
            mode={mode}
            text={t('app.plugins.token.tokenDelegationForm.info')}
        />
    );

    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(handleFormSubmit)}
        >
            <RadioGroup
                onValueChange={handleSelectionChange}
                value={selectionValue}
                {...selectionField}
            >
                <RadioCard
                    label={t(
                        'app.plugins.token.tokenDelegationForm.selection.option.self',
                    )}
                    value={TokenDelegationSelection.YOURSELF}
                />
                <RadioCard
                    label={t(
                        'app.plugins.token.tokenDelegationForm.selection.option.other',
                    )}
                    value={TokenDelegationSelection.OTHER}
                />
            </RadioGroup>
            <AddressInput
                chainId={chainId}
                disabled={selectionValue === TokenDelegationSelection.YOURSELF}
                helpText={t(
                    'app.plugins.token.tokenDelegationForm.delegate.helpText',
                )}
                onAccept={handleDelegateChange}
                onChange={setDelegateInput}
                placeholder={t(
                    'app.plugins.token.tokenDelegationForm.delegate.placeholder',
                )}
                value={delegateInput}
                {...delegateField}
            />
            {mode === 'dialog' ? (
                <div className="flex flex-col gap-9">
                    {footerInfo}
                    <div
                        className={classNames(
                            'flex gap-3',
                            onCancel != null
                                ? 'justify-between'
                                : 'justify-end',
                        )}
                    >
                        {onCancel != null && (
                            <Button
                                onClick={onCancel}
                                size="md"
                                variant="tertiary"
                            >
                                {t(
                                    'app.plugins.token.tokenDelegationForm.cancel',
                                )}
                            </Button>
                        )}
                        <Button
                            disabled={isSubmitDisabled}
                            iconRight={IconType.CHEVRON_RIGHT}
                            onClick={
                                isConnected ? undefined : () => walletGuard()
                            }
                            size="md"
                            type={isConnected ? 'submit' : undefined}
                        >
                            {t(
                                'app.plugins.token.tokenDelegationForm.submitDialog',
                            )}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <Button
                        disabled={isSubmitDisabled}
                        onClick={isConnected ? undefined : () => walletGuard()}
                        type={isConnected ? 'submit' : undefined}
                    >
                        {t('app.plugins.token.tokenDelegationForm.submit')}
                    </Button>
                    {footerInfo}
                </div>
            )}
        </form>
    );
};
