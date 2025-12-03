import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import {
    addressUtils,
    Button,
    formatterUtils,
    IconType,
    InputContainer,
    NumberFormat,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { type ChangeEvent, type MouseEvent, useCallback, useEffect, useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { formatUnits } from 'viem';
import type { IAsset } from '../../api/financeService';
import { FinanceDialogId } from '../../constants/financeDialogId';
import type { IAssetSelectionDialogParams } from '../../dialogs/assetSelectionDialog';
import { AssetInputToken } from './assetInputToken';

export interface IAssetInputPercentageSelectionConfig {
    /**
     * Total available balance for percentage calculations.
     */
    totalBalance?: bigint;
    /**
     * Token decimals for percentage calculations.
     */
    tokenDecimals: number;
}

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
     * Hides the amount field when set to true. Show only asset selector.
     */
    hideAmount?: boolean;
    /**
     * Minimum value for the amount field.
     */
    minAmount?: number;
    /**
     * Configuration for percentage selection feature.
     */
    percentageSelection?: IAssetInputPercentageSelectionConfig;
}

const valuePercentages = ['0', '25', '50', '75', '100'] as const;

export const AssetInput: React.FC<IAssetInputProps> = (props) => {
    const {
        fetchAssetsParams,
        fieldPrefix,
        onAmountChange,
        disableAssetField,
        hideMax,
        hideAmountLabel,
        hideAmount,
        minAmount,
        percentageSelection,
    } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const inputId = useId();
    const { clearErrors } = useFormContext();

    const [percentageValue, setPercentageValue] = useState('100');

    const isPercentageSelectionEnabled = percentageSelection != null;
    const { totalBalance, tokenDecimals } = percentageSelection ?? {};

    const assetField = useFormField<IAssetInputFormData, 'asset'>('asset', { rules: { required: true }, fieldPrefix });

    const {
        label: amountLabel,
        onChange: onAmountFieldChange,
        ...amountField
    } = useFormField<IAssetInputFormData, 'amount'>('amount', {
        label: t('app.finance.transferAssetForm.amount.label'),
        rules: hideAmount
            ? undefined
            : {
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

        // Clear percentage selection when manually typing
        if (isPercentageSelectionEnabled) {
            setPercentageValue('');
        }
    };

    const updateAmountField = useCallback(
        (percentageValue?: string) => {
            if (totalBalance == null || tokenDecimals == null || percentageValue == null) {
                return;
            }

            const processedValue = (totalBalance * BigInt(percentageValue)) / BigInt(100);
            const parsedValue = formatUnits(processedValue, tokenDecimals);
            onAmountFieldChange(parsedValue);
        },
        [totalBalance, tokenDecimals, onAmountFieldChange],
    );

    const handlePercentageChange = useCallback(
        (value?: string) => {
            if (!value) {
                return;
            }

            updateAmountField(value);
            setPercentageValue(value);
        },
        [updateAmountField],
    );

    // Update amount field and percentage value to 100% on user balance change
    useEffect(() => handlePercentageChange('100'), [handlePercentageChange]);

    // Prevent default behaviour of the select button mouse-down event to avoid displaying a validation error on the
    // amount field on select button click.
    const handleSelectMouseDown = (event: MouseEvent) => event.preventDefault();

    // Only update asset field when selecting a new token and clear amount value and errors when selecting a new token
    const handleAssetChange = (asset: IAsset) => {
        if (addressUtils.isAddressEqual(asset.token.address, assetField.value?.token.address)) {
            return;
        }

        assetField.onChange(asset);
        handleAmountFieldChange('');
        clearErrors(amountField.name);
    };

    const handleOpenDialog = () => {
        if (!fetchAssetsParams || disableAssetField) {
            return;
        }

        const params: IAssetSelectionDialogParams = {
            initialParams: fetchAssetsParams,
            onAssetClick: handleAssetChange,
            close: () => close(FinanceDialogId.ASSET_SELECTION),
        };
        open(FinanceDialogId.ASSET_SELECTION, { params, stack: true });
    };

    const handleMaxAmount = (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        handleAmountFieldChange(assetField.value?.amount);
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

    const renderAssetButton = () =>
        disableAssetField ? (
            <AssetInputToken token={assetField.value?.token} className="cursor-default px-2" />
        ) : (
            <Button
                variant="tertiary"
                size="sm"
                onClick={handleOpenDialog}
                onMouseDown={handleSelectMouseDown}
                iconRight={IconType.CHEVRON_DOWN}
                className="shrink-0"
            >
                <AssetInputToken token={assetField.value?.token} />
            </Button>
        );

    return hideAmount ? (
        <div>{renderAssetButton()}</div>
    ) : (
        <div className="flex flex-col gap-y-3">
            <InputContainer
                id={inputId}
                wrapperClassName="pl-1.5 pr-4 items-center"
                label={hideAmountLabel ? undefined : amountLabel}
                {...amountField}
            >
                {renderAssetButton()}
                <input
                    type="number"
                    placeholder="0"
                    className={inputClassName}
                    value={amountField.value ?? ''}
                    onChange={handleAmountFieldChange}
                    disabled={!assetField.value}
                />
                <p>{formattedAmountValue}</p>
            </InputContainer>
            {isPercentageSelectionEnabled && (
                <ToggleGroup
                    isMultiSelect={false}
                    value={percentageValue}
                    onChange={handlePercentageChange}
                    variant="space-between"
                >
                    {valuePercentages.map((value) => (
                        <Toggle key={value} value={value} label={t(`app.finance.assetInput.percentage.${value}`)} />
                    ))}
                </ToggleGroup>
            )}
            {assetField.value?.amount && !hideMax && (
                <div className="flex items-center gap-x-1 self-end pr-4">
                    <button
                        type="button"
                        className="text-primary-400 hover:text-primary-600 cursor-pointer"
                        onClick={handleMaxAmount}
                    >
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
