import { type IAsset, type IGetAssetListParams } from '@/modules/finance/api/financeService';
import { AssetList } from '@/modules/finance/components/assetList';
import { type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Dialog, invariant } from '@aragon/ods';

export interface IAssetSelectionDialogParams {
    initialParams: IGetAssetListParams;
    onAssetClick: (asset: IAsset) => void;
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
            <Dialog.Header title={t('app.finance.assetSelectionDialog.heading')} onCloseClick={close} />
            <Dialog.Content className="flex flex-col gap-6 py-7">
                <AssetList initialParams={initialParams} onAssetClick={handleSelectAsset} hasSearch={true} />
            </Dialog.Content>
        </>
    );
};
