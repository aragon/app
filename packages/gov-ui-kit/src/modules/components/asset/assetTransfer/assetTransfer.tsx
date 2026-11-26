import classNames from 'classnames';
import { zeroAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { Avatar, AvatarIcon, DataList, formatterUtils, IconType, NumberFormat } from '../../../../core';
import { ChainEntityType, useBlockExplorer } from '../../../hooks';
import type { ICompositeAddress, IWeb3ComponentProps } from '../../../types';
import { AssetTransferAddress } from './assetTransferAddress';

export interface IAssetTransferProps extends IWeb3ComponentProps {
    /**
     * Sender of the transaction.
     */
    sender: ICompositeAddress;
    /**
     * Recipient of the transaction.
     */
    recipient: ICompositeAddress;
    /**
     * Name of the asset transferred.
     */
    assetName: string;
    /**
     * Address of the asset transferred.
     */
    assetAddress?: string;
    /**
     * Icon URL of the transferred asset.
     */
    assetIconSrc?: string;
    /**
     * Asset amount that was transferred.
     */
    assetAmount: number | string;
    /**
     * Symbol of the asset transferred. Example: ETH, DAI, etc.
     */
    assetSymbol: string;
    /**
     * Price per asset in fiat.
     */
    assetFiatPrice?: number | string;
}

/**
 * Usage notes:
 *
 * - For a non-native transfer, the asset row uses the token's block-explorer URL and opens it in a new tab;
 *   `assetAddress` set to the zero address marks a native transfer and leaves the row unlinked.
 * - The fiat value line is visually blank when the optional `assetFiatPrice` is absent; when supplied, it is
 *   calculated as `assetAmount × assetFiatPrice`.
 * - `assetAmount` uses signed formatting, so positive transfers receive a leading `+` (negative values retain their
 *   `-` sign).
 */
export const AssetTransfer: React.FC<IAssetTransferProps> = (props) => {
    const {
        sender,
        recipient,
        assetName,
        assetAddress,
        assetIconSrc,
        assetAmount,
        assetSymbol,
        assetFiatPrice,
        chainId = mainnet.id,
        wagmiConfig,
    } = props;

    const { buildEntityUrl } = useBlockExplorer({ chains: wagmiConfig?.chains, chainId });

    const senderUrl = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: sender.address });
    const recipientUrl = buildEntityUrl({ type: ChainEntityType.ADDRESS, id: recipient.address });

    // For native transfers we do not want to link to the block explorer
    const isNativeTransfer = assetAddress === zeroAddress;
    const assetUrl = isNativeTransfer ? undefined : buildEntityUrl({ type: ChainEntityType.TOKEN, id: assetAddress });

    const formattedTokenValue = formatterUtils.formatNumber(assetAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
        withSign: true,
        fallback: '-',
    })!;
    const formattedTokenAmount = `${formattedTokenValue} ${assetSymbol}`;

    const fiatValue = Number(assetAmount) * Number(assetFiatPrice);
    const formattedFiatValue = formatterUtils.formatNumber(fiatValue, {
        format: NumberFormat.FIAT_TOTAL_SHORT,
        fallback: ' ',
    });

    return (
        <div className="flex size-full flex-col gap-y-related--8-12">
            <div className="relative flex h-full flex-col rounded-xl bg-surface-primary md:flex-row">
                <AssetTransferAddress addressUrl={senderUrl} participant={sender} txRole="sender" />
                <div className="border-t border-surface-primary md:border-l" />
                <AvatarIcon
                    className={classNames(
                        'absolute top-1/2 left-4 -translate-y-1/2 bg-surface-secondary icon-surface-secondary', //base
                        'md:left-1/2 md:-translate-x-1/2 md:-rotate-90', //responsive
                    )}
                    icon={IconType.CHEVRON_DOWN}
                    size="sm"
                />
                <AssetTransferAddress addressUrl={recipientUrl} participant={recipient} txRole="recipient" />
            </div>
            <DataList.Item
                className="flex h-16 items-center justify-between px-inset-surface md:h-20"
                href={assetUrl}
                rel="noopener noreferrer"
                target="_blank"
            >
                <div className="space-x-related--12-16 flex items-center">
                    <Avatar responsiveSize={{ md: 'md' }} src={assetIconSrc} />
                    <span className="type-title-item--compact-list text-surface-primary">{assetName}</span>
                </div>
                <div className="flex flex-col items-end justify-end">
                    <span className="type-supporting text-surface-primary">{formattedTokenAmount}</span>
                    <span className="type-supporting text-surface-secondary">{formattedFiatValue}</span>
                </div>
            </DataList.Item>
        </div>
    );
};
