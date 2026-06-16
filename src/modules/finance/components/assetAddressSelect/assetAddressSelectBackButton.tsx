import { DataListActionItem, IconType } from '@aragon/gov-ui-kit';
import type { ComponentProps } from 'react';
import { useTranslations } from '../../../../shared/components/translationsProvider';

export interface IAssetAddressSelectBackButtonProps
    extends ComponentProps<'button'> {}

export const AssetAddressSelectBackButton: React.FC<
    IAssetAddressSelectBackButtonProps
> = (props) => {
    const { t } = useTranslations();

    return (
        <DataListActionItem
            icon={IconType.CHEVRON_LEFT}
            label={t('app.finance.assetAddressSelect.backButton.label')}
            variant="neutral"
            {...props}
        />
    );
};
