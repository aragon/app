import { type IAsset } from '@/modules/finance/api/financeService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SharedDialogs } from '@/shared/constants/moduleDialogs';
import {
    Avatar,
    Button,
    formatterUtils,
    IconType,
    type IInputContainerAlert,
    InputContainer,
    NumberFormat,
} from '@aragon/ods';
import classNames from 'classnames';
import { useState } from 'react';

export interface IAssetInputProps {
    /**
     * The DAO id.
     */
    daoId: string;
    /**
     * Callback function when an asset is selected.
     */
    onAssetSelect?: (asset: IAsset) => void;
}

export const AssetInput: React.FC<IAssetInputProps> = (props) => {
    const { daoId } = props;

    const [selectedAsset, setSelectedAsset] = useState<IAsset>();
    const [inputValue, setInputValue] = useState<string | number | undefined | null>('0');
    const [alert, setAlert] = useState<IInputContainerAlert | null>(null);

    const { t } = useTranslations();

    const { open, close } = useDialogContext();

    const useDaoParams = { id: daoId };

    const { data: dao } = useDao({ urlParams: useDaoParams });

    const initialParams = {
        queryParams: { address: dao?.address, network: dao?.network },
    };

    const params = { initialParams, setSelectedAsset, close };

    const handleOpenDialog = () => {
        open(SharedDialogs.ASSET_SELECTION, { params });
        setInputValue(null);
        setSelectedAsset(undefined);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);

        if (selectedAsset?.amount && newValue > Number(selectedAsset.amount)) {
            setAlert({
                message: t('app.finance.assetInput.maxAmountError'),
                variant: 'warning',
            });
        } else {
            setAlert(null);
        }

        setInputValue(newValue);
    };

    const inputClassName = classNames(
        'size-full rounded-xl bg-transparent px-4 py-3 caret-neutral-500 outline-none placeholder:text-base placeholder:font-normal placeholder:leading-tight placeholder:text-neutral-300',
    );

    return (
        <div className="flex flex-col gap-y-3">
            <InputContainer id={daoId} wrapperClassName="pl-1.5 pr-4 items-center" alert={alert ?? undefined}>
                <Button
                    variant="tertiary"
                    size="sm"
                    iconRight={IconType.CHEVRON_DOWN}
                    onClick={handleOpenDialog}
                    className="shrink-0"
                >
                    <div className="flex items-center gap-x-1.5">
                        {selectedAsset?.token && <Avatar src={selectedAsset.token.logo} size="sm" />}
                        {selectedAsset?.token
                            ? selectedAsset.token.symbol
                            : t('app.finance.assetInput.triggerLabelDefault')}
                    </div>
                </Button>
                <input
                    type="number"
                    placeholder="0"
                    className={inputClassName}
                    value={inputValue ?? ''}
                    onChange={handleInputChange}
                    disabled={selectedAsset?.token === undefined}
                />
                <p>
                    {selectedAsset?.token
                        ? formatterUtils.formatNumber(Number(inputValue) * Number(selectedAsset.token.priceUsd), {
                              format: NumberFormat.FIAT_TOTAL_SHORT,
                          })
                        : `$0.00`}
                </p>
            </InputContainer>
            {selectedAsset?.amount && (
                <div className="flex items-center gap-x-1 self-end pr-4">
                    <button
                        className="text-primary-400 hover:text-primary-600"
                        onClick={() => setInputValue(selectedAsset.amount)}
                    >
                        {t('app.finance.assetInput.maxButtonLabel')}
                    </button>
                    {formatterUtils.formatNumber(selectedAsset.amount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}
                </div>
            )}
        </div>
    );
};
