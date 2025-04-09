import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useMember } from '@/modules/governance/api/governanceService';
import { TokenPluginDialog } from '@/plugins/tokenPlugin/constants/pluginDialogs';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
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
import type { ITokenDelegationDialogParams } from '../../dialogs/tokenDelegationDialog';
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
    delegate?: string;
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
}

export const TokenDelegationForm: React.FC<ITokenDelegationFormProps> = (props) => {
    const { plugin, daoId } = props;

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { data: tokenMember, isLoading: isMemberLoading } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const defaultValues: ITokenDelegationFormData = useMemo(() => {
        const isSelfDelegate = addressUtils.isAddressEqual(address, tokenMember?.currentDelegate ?? undefined);
        const defaultDelegate = tokenMember?.currentDelegate ?? undefined;

        return {
            selection: isSelfDelegate ? TokenDelegationSelection.YOURSELF : TokenDelegationSelection.OTHER,
            delegate: defaultDelegate,
        };
    }, [address, tokenMember]);

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
        const newDelegateInput = value === TokenDelegationSelection.YOURSELF ? address : tokenMember?.currentDelegate;
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
        open(TokenPluginDialog.TOKEN_DELEGATION, { params });
    };

    // Update form initial data on user address / backend data update
    useEffect(() => {
        reset(defaultValues);
        setDelegateInput(defaultValues.delegate);
    }, [reset, defaultValues]);

    const isDelegateUnchanged = useMemo(
        () => addressUtils.isAddressEqual(delegate, tokenMember?.currentDelegate ?? undefined),
        [delegate, tokenMember?.currentDelegate],
    );

    // disable submit button if delegate address has not been changed, but also, disable while isMemberLoading to prevent
    // multiple button state changes during page refresh
    const isSubmitDisabled = isMemberLoading || isDelegateUnchanged;

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
                chainId={1}
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
                <p className="text-center text-sm font-normal leading-normal text-neutral-500">
                    {t('app.plugins.token.tokenDelegationForm.info')}
                </p>
            </div>
        </form>
    );
};
