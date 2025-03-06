import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Avatar, Button, formatterUtils, IconType, InputContainer, NumberFormat } from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useId } from 'react';
import type { IAsset } from '../../api/financeService';
import { FinanceDialogs } from '../../constants/moduleDialogs';
import type { IAssetSelectionDialogParams } from '../../dialogs/assetSelectionDialog';

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
}

export const AssetInput: React.FC<IAssetInputProps> = (props) => {
    const { fetchAssetsParams, fieldPrefix, disableAssetField, hideMax, hideAmountLabel } = props;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const inputId = useId();

    const assetField = useFormField<IAssetInputFormData, 'asset'>('asset', {
        rules: { required: true },
        fieldPrefix,
    });

    const { label: amountLabel, ...amountField } = useFormField<IAssetInputFormData, 'amount'>('amount', {
        label: t('app.finance.transferAssetForm.amount.label'),
        rules: { required: true, max: assetField.value?.amount, validate: (value) => parseFloat(value ?? '') > 0 },
        fieldPrefix,
    });

    const handleOpenDialog = () => {
        if (!fetchAssetsParams || disableAssetField) {
            return;
        }

        const { onChange: onAssetClick } = assetField;
        const params: IAssetSelectionDialogParams = { initialParams: fetchAssetsParams, onAssetClick, close };
        open(FinanceDialogs.ASSET_SELECTION, { params });
    };

    const handleMaxAmount = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        amountField.onChange(assetField.value?.amount);
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
                <Button
                    variant="tertiary"
                    size="sm"
                    iconRight={disableAssetField ? undefined : IconType.CHEVRON_DOWN}
                    onClick={handleOpenDialog}
                    className="shrink-0"
                >
                    <div className="flex items-center gap-x-1.5">
                        {assetField.value?.token && <Avatar src={assetField.value.token.logo} size="sm" />}
                        {assetField.value?.token
                            ? assetField.value.token.symbol
                            : t('app.finance.assetInput.triggerLabelDefault')}
                    </div>
                </Button>
                <input
                    type="number"
                    placeholder="0"
                    className={inputClassName}
                    value={amountField.value}
                    onChange={amountField.onChange}
                    disabled={!assetField.value}
                />
                <p>{formattedAmountValue}</p>
            </InputContainer>
            {assetField.value?.amount && !hideMax && (
                <div className="flex items-center gap-x-1 self-end pr-4">
                    <button className="text-primary-400 hover:text-primary-600" onClick={(e) => handleMaxAmount(e)}>
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
