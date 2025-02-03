import { type IAsset, type IGetAssetListParams } from '@/modules/finance/api/financeService';
import { AssetList } from '@/modules/finance/components/assetList';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/gov-ui-kit';

export interface IAssetSelectionDialogParams {
    /**
     * Initial params to fetch the asset list.
     */
    initialParams: IGetAssetListParams;
    /**
     * Callback called on token click.
     */
    onAssetClick: (asset: IAsset) => void;
    /**
     * Callback called on dialog close.
     */
    close: () => void;
}

export interface IAssetSelectionDialogProps extends IDialogComponentProps<IAssetSelectionDialogParams> {}

export const AssetSelectionDialog: React.FC<IAssetSelectionDialogProps> = (props) => {
    const { location } = props;

    const { t } = useTranslations();

    invariant(location.params != null, 'AssetSelectionDialog: required parameters must be set.');

    const { initialParams, onAssetClick, close } = location.params;

    const handleSelectAsset = (asset: IAsset) => {
        onAssetClick(asset);
        close();
    };

    return (
        <>
            <Dialog.Header title={t('app.finance.assetSelectionDialog.title')} onClose={close} />
            <Dialog.Content className="flex flex-col gap-6 py-7">
                <AssetList initialParams={initialParams} onAssetClick={handleSelectAsset} hasSearch={true} />
            </Dialog.Content>
        </>
    );
};
