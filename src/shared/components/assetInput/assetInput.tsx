import { type IAsset } from '@/modules/finance/api/financeService';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
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
    daoId: string;
}

export const AssetInput: React.FC<IAssetInputProps> = (props) => {
    const { daoId } = props;

    const [selectedAsset, setSelectedAsset] = useState<IAsset>();
    const [inputValue, setInputValue] = useState<string | number | undefined | null>('0');
    const [alert, setAlert] = useState<IInputContainerAlert | null>(null);

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
                message: `Amount cannot exceed ${formatterUtils.formatNumber(selectedAsset.amount, {
                    format: NumberFormat.TOKEN_AMOUNT_LONG,
                })}`,
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
        <div className="flex flex-col">
            <InputContainer id={daoId} wrapperClassName="px-1.5 items-center" alert={alert ?? undefined}>
                <Button
                    variant="tertiary"
                    size="sm"
                    iconRight={IconType.CHEVRON_DOWN}
                    onClick={handleOpenDialog}
                    className="shrink-0"
                >
                    <div className="flex items-center gap-x-1.5">
                        {selectedAsset?.token && <Avatar src={selectedAsset.token.logo} size="sm" />}
                        {selectedAsset?.token ? selectedAsset.token.symbol : 'Select'}
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
                        : formatterUtils.formatNumber(inputValue, {
                              format: NumberFormat.FIAT_TOTAL_SHORT,
                          })}
                </p>
            </InputContainer>
            {selectedAsset?.amount && (
                <div className="flex items-center gap-x-1 self-end px-4">
                    <button
                        className="text-primary-400 hover:text-primary-600"
                        onClick={() => setInputValue(selectedAsset.amount)}
                    >
                        Max
                    </button>
                    {formatterUtils.formatNumber(selectedAsset.amount, { format: NumberFormat.TOKEN_AMOUNT_SHORT })}
                </div>
            )}
        </div>
    );
};
