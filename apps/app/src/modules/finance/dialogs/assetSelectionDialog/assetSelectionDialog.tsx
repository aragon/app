import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { IAsset } from '@/modules/finance/api/financeService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AssetAddressSelect } from '../../components/assetAddressSelect';
import type { AssetListParams } from '../../types';

export interface IAssetSelectionDialogParams {
    /**
     * Initial params to fetch the asset list: the assets of a DAO, or the balances of a Safe.
     */
    initialParams: AssetListParams;
    /**
     * Callback called on token click.
     */
    onAssetClick: (asset: IAsset) => void;
    /**
     * Callback called on dialog close.
     */
    close: () => void;
}

export interface IAssetSelectionDialogProps
    extends IDialogComponentProps<IAssetSelectionDialogParams> {}

export const AssetSelectionDialog: React.FC<IAssetSelectionDialogProps> = (
    props,
) => {
    const { location } = props;

    const { t } = useTranslations();

    invariant(
        location.params != null,
        'AssetSelectionDialog: required parameters must be set.',
    );

    const { initialParams, onAssetClick, close } = location.params;

    const handleSelectAsset = (asset: IAsset) => {
        onAssetClick(asset);
        close();
    };

    return (
        <>
            <Dialog.Header
                onClose={close}
                title={t('app.finance.assetSelectionDialog.title')}
            />
            <Dialog.Content className="flex flex-col gap-section py-inset-surface-wide--fixed-28">
                <AssetAddressSelect
                    hasSearch={true}
                    initialParams={initialParams}
                    onAssetClick={handleSelectAsset}
                />
            </Dialog.Content>
        </>
    );
};
