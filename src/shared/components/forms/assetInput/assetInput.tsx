import { type ITransferAssetFormData } from '@/modules/finance/components/transferAssetForm';
import { type Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SharedDialogs } from '@/shared/constants/moduleDialogs';
import { type IAssetSelectionDialogParams } from '@/shared/dialogs/assetSelectionDialog/assetSelectionDialog';
import { type IUseFormFieldReturn } from '@/shared/hooks/useFormField';
import { Avatar, Button, formatterUtils, IconType, InputContainer, NumberFormat } from '@aragon/ods';
import classNames from 'classnames';

export interface IAssetInputProps {
    /**
     * Sender address of the DAO.
     */
    sender: string;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Form field for the asset.
     */
    assetField: IUseFormFieldReturn<ITransferAssetFormData, 'asset'>;
    /**
     * Form field for the amount.
     */
    amountField: IUseFormFieldReturn<ITransferAssetFormData, 'amount'>;
}

export const AssetInput: React.FC<IAssetInputProps> = (props) => {
    const { assetField, amountField, sender, network } = props;

    const { t } = useTranslations();

    const { open, close } = useDialogContext();

    const initialParams = {
        queryParams: { address: sender, network },
    };

    const params: IAssetSelectionDialogParams = { initialParams, onAssetClick: assetField.onChange, close };

    const handleOpenDialog = () => {
        open(SharedDialogs.ASSET_SELECTION, { params });
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

    return (
        <div className="flex flex-col gap-y-3">
            <InputContainer id={sender} wrapperClassName="pl-1.5 pr-4 items-center" {...amountField}>
                <Button
                    variant="tertiary"
                    size="sm"
                    iconRight={IconType.CHEVRON_DOWN}
                    onClick={handleOpenDialog}
                    className="shrink-0"
                >
                    <div className="flex items-center gap-x-1.5">
                        {assetField.value?.token && <Avatar src={assetField.value?.token.logo} size="sm" />}
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
                <p>
                    {assetField.value?.token
                        ? formatterUtils.formatNumber(
                              Number(amountField.value) * Number(assetField.value.token.priceUsd),
                              {
                                  format: NumberFormat.FIAT_TOTAL_SHORT,
                              },
                          )
                        : `$0.00`}
                </p>
            </InputContainer>
            {assetField.value?.amount && (
                <div className="flex items-center gap-x-1 self-end pr-4">
                    <button className="text-primary-400 hover:text-primary-600" onClick={(e) => handleMaxAmount(e)}>
                        {t('app.finance.assetInput.maxButtonLabel')}
                    </button>
                    {formatterUtils.formatNumber(assetField.value.amount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}
                </div>
            )}
        </div>
    );
};
