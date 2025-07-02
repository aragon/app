import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, IconType, formatterUtils, InputContainer, NumberFormat } from '@aragon/gov-ui-kit';
import { useFormContext } from 'react-hook-form';
import classNames from 'classnames';
import { type ChangeEvent, type MouseEvent, useEffect, useId, useRef } from 'react';
import type { IAsset } from '../../api/financeService';
import { FinanceDialogId } from '../../constants/financeDialogId';
import type { IAssetSelectionDialogParams } from '../../dialogs/assetSelectionDialog';
import { AssetInputToken } from './assetInputToken';

export interface IAssetInputFormData {
    /**
     * The amount of tokens to be sent.
     */
    amount?: string;
    /**
     * The token to be transfered.
     */
    asset?: IAsset;
}

export interface IAssetInputProps {
    /**
     * Parameters for fetching the list of assets to be displayed on the asset selection dialog.
     */
    fetchAssetsParams?: IAssetSelectionDialogParams['initialParams'];
    /**
     * Prefix to be prepended to all form fields.
     */
    fieldPrefix?: string;
    /**
     * Callback called on asset amount change.
     */
    onAmountChange?: () => void;
    /**
     * Disables the token selection when set to true.
     */
    disableAssetField?: boolean;
    /**
     * Hides the max button when set to true.
     */
    hideMax?: boolean;
    /**
     * Hides the amount label when set to true.
     */
    hideAmountLabel?: boolean;
    /**
     * Minimum value for the amount field.
     */
    minAmount?: number;
}

export const AssetInput: React.FC<IAssetInputProps> = (props) => {
    const { fetchAssetsParams, fieldPrefix, onAmountChange, disableAssetField, hideMax, hideAmountLabel, minAmount } =
        props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);

    const assetField = useFormField<IAssetInputFormData, 'asset'>('asset', { rules: { required: true }, fieldPrefix });

    const {
        label: amountLabel,
        onChange: onAmountFieldChange,
        ...amountField
    } = useFormField<IAssetInputFormData, 'amount'>('amount', {
        label: t('app.finance.transferAssetForm.amount.label'),
        rules: {
            required: true,
            max: assetField.value?.amount,
            min: minAmount,
            validate: (value) => parseFloat(value ?? '') > 0,
        },
        fieldPrefix,
    });

    const handleAmountFieldChange = (amount?: string | ChangeEvent<HTMLInputElement>) => {
        onAmountFieldChange(amount);
        onAmountChange?.();
    };

    const handleCloseDialog = () => {
        close();
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleOpenDialog = () => {
        if (!fetchAssetsParams || disableAssetField) {
            return;
        }

        const { onChange: onAssetClick } = assetField;
        const params: IAssetSelectionDialogParams = {
            initialParams: fetchAssetsParams,
            onAssetClick,
            close: handleCloseDialog,
        };
        open(FinanceDialogId.ASSET_SELECTION, { params, onClose: handleCloseDialog });
    };

    const { setValue, clearErrors } = useFormContext<IAssetInputFormData>();
    const previousAssetRef = useRef<IAsset | undefined>(assetField.value);

    useEffect(() => {
        if (previousAssetRef.current && previousAssetRef.current !== assetField.value) {
            setValue(amountField.name, '', { shouldValidate: false });
            clearErrors(amountField.name);
            onAmountChange?.();
        }

        previousAssetRef.current = assetField.value;
    }, [assetField.value, amountField.name, setValue, clearErrors, onAmountChange]);

    const handleMaxAmount = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const maxAmount = assetField.value?.amount ?? '';
        setValue(amountField.name, maxAmount, { shouldValidate: true });
        onAmountChange?.();
    };

    const handleTokenSelectorMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const inputClassName = classNames(
        'size-full rounded-xl bg-transparent px-4 py-3 caret-neutral-500 outline-none [appearance:textfield]', // base styles
        ' placeholder:text-base placeholder:font-normal placeholder:leading-tight placeholder:text-neutral-300', // placeholder styles
        '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none', // remove incr/decr buttons for number type
    );

    const amountValue = Number(amountField.value) * Number(assetField.value?.token.priceUsd);
    const formattedAmountValue = assetField.value?.token
        ? formatterUtils.formatNumber(amountValue, { format: NumberFormat.FIAT_TOTAL_SHORT })
        : `$0.00`;

    return (
        <div className="flex flex-col gap-y-3">
            <InputContainer
                id={inputId}
                wrapperClassName="pl-1.5 pr-4 items-center"
                label={hideAmountLabel ? undefined : amountLabel}
                {...amountField}
            >
                {!disableAssetField && (
                    <Button
                        variant="tertiary"
                        size="sm"
                        onMouseDown={handleTokenSelectorMouseDown}
                        onClick={handleOpenDialog}
                        iconRight={IconType.CHEVRON_DOWN}
                        className="shrink-0"
                    >
                        <AssetInputToken token={assetField.value?.token} />
                    </Button>
                )}
                {disableAssetField && (
                    <AssetInputToken token={assetField.value?.token} className="cursor-default px-2" />
                )}
                <input
                    ref={inputRef}
                    type="number"
                    placeholder="0"
                    className={inputClassName}
                    value={amountField.value ?? ''}
                    onChange={handleAmountFieldChange}
                    disabled={!assetField.value}
                />
                <p>{formattedAmountValue}</p>
            </InputContainer>
            {assetField.value?.amount && !hideMax && (
                <div className="flex items-center gap-x-1 self-end pr-4">
                    <button type="button" className="text-primary-400 hover:text-primary-600" onClick={handleMaxAmount}>
                        {t('app.finance.assetInput.maxButtonLabel')}
                    </button>
                    <span className="text-neutral-500">
                        {formatterUtils.formatNumber(assetField.value.amount, {
                            format: NumberFormat.TOKEN_AMOUNT_SHORT,
                        })}
                    </span>
                </div>
            )}
        </div>
    );
};
