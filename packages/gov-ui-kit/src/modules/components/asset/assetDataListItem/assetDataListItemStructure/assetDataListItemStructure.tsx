import classNames from 'classnames';
import type React from 'react';
import { Avatar, DataList, formatterUtils, type IDataListItemProps, NumberFormat } from '../../../../../core';
import { useGukModulesContext } from '../../../gukModulesProvider';

export type IAssetDataListItemStructureProps = IDataListItemProps & {
    /**
     * The name of the asset.
     */
    name: string;
    /**
     * The symbol of the asset.
     */
    symbol: string;
    /**
     * The amount of the asset.
     */
    amount: number | string;
    /**
     * The logo source of the asset
     */
    logoSrc?: string;
    /**
     * The fiat price of the asset.
     */
    fiatPrice?: number | string;
    /**
     * Hides the asset value when set to true.
     */
    hideValue?: boolean;
};

export const AssetDataListItemStructure: React.FC<IAssetDataListItemStructureProps> = (props) => {
    const { logoSrc, name, amount, symbol, fiatPrice, className, hideValue, ...otherProps } = props;

    const { copy } = useGukModulesContext();

    const fiatValue = Number(amount) * Number(fiatPrice);
    const formattedValue = formatterUtils.formatNumber(fiatValue, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
        fallback: copy.assetDataListItemStructure.unknown,
    });

    const formattedAmount = formatterUtils.formatNumber(amount, { format: NumberFormat.TOKEN_AMOUNT_SHORT });
    const parsedAmount = `${formattedAmount!} ${symbol}`;

    return (
        <DataList.Item
            className={classNames('flex items-center justify-between gap-x-related py-inset-item', className)}
            {...otherProps}
        >
            <div className="flex min-w-0 items-center gap-related--12-16">
                <Avatar className="block shrink-0" responsiveSize={{ md: 'md', sm: 'sm' }} src={logoSrc} />
                <span className="truncate type-title-item text-surface-primary">{name}</span>
            </div>
            <div className="flex min-w-0 gap-x-related--fixed-8 text-right">
                <div className="flex min-w-0 flex-col gap-y-tight">
                    <span className="truncate type-supporting--row-value text-surface-primary">{parsedAmount}</span>
                    {!hideValue && (
                        <span className="truncate type-supporting text-surface-secondary">{formattedValue}</span>
                    )}
                </div>
            </div>
        </DataList.Item>
    );
};
