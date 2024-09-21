import { type IGetAssetListParams, type IToken } from '@/modules/finance/api/financeService';
import { AssetList } from '@/modules/finance/components/assetList';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { Dialog, invariant } from '@aragon/ods';

export interface IAssetSelectionDialogParams {
    initialParams: IGetAssetListParams;
    setSelectedAsset: (asset: { token: IToken; amount: number | string }) => void;
    close: () => void;
}

export interface IAssetSelectionDialogProps extends IDialogComponentProps<IAssetSelectionDialogParams> {}

export const AssetSelectionDialog: React.FC<IAssetSelectionDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'AssetSelectionDialog: required parameters must be set.');

    const { initialParams, setSelectedAsset, close } = location.params;

    const handleSelectAsset = (asset: { token: IToken; amount: number | string }) => {
        setSelectedAsset(asset);

        close();
    };

    const handleDialogClose = () => {
        close();
    };

    return (
        <>
            <Dialog.Header title="Select an asset" onCloseClick={handleDialogClose} />
            <Dialog.Content className="flex flex-col gap-6 py-7">
                <AssetList
                    initialParams={initialParams}
                    isLinking={false}
                    onAssetSelect={handleSelectAsset}
                    hasSearch={true}
                />
            </Dialog.Content>
        </>
    );
};
