import { DataListActionItem, IconType } from '@aragon/gov-ui-kit';
import type { ComponentProps } from 'react';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface IAssetAddressSelectAddButtonProps
    extends ComponentProps<'button'> {}

export const AssetAddressSelectAddButton: React.FC<
    IAssetAddressSelectAddButtonProps
> = (props) => {
    const { t } = useTranslations();

    return (
        <DataListActionItem
            icon={IconType.PLUS}
            label={t('app.finance.assetAddressSelect.addButton.label')}
            variant="primary"
            {...props}
        />
    );
};
