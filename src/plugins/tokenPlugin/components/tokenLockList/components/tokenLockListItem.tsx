import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import {
    Avatar,
    Button,
    DataList,
    DateFormat,
    formatterUtils,
    Heading,
    NumberFormat,
    Rerender,
    Tag,
    type TagVariant,
} from '@aragon/gov-ui-kit';
import NumberFlow from '@number-flow/react';
import { DateTime } from 'luxon';
import { formatUnits, type Hex } from 'viem';
import type { IMemberLock } from '../../../api/tokenService';
import { TokenPluginDialogId } from '../../../constants/tokenPluginDialogId';
import type { ITokenApproveNftDialogParams } from '../../../dialogs/tokenApproveNftDialog';
import type { ITokenLockUnlockDialogParams } from '../../../dialogs/tokenLockUnlockDialog';
import type { LockStatus } from '../../../dialogs/tokenLocksDialog/tokenLocksDialog';
import { tokenLocksDialogUtils } from '../../../dialogs/tokenLocksDialog/tokenLocksDialogUtils';
import { useNftNeedsApproval } from '../../../hooks/useNftNeedsApproval';
import type { ITokenPlugin } from '../../../types';

export interface ITokenLockListItemProps {
    /**
     * VE lock to display.
     */
    lock: IMemberLock;
    /**
     * Token plugin containing voting escrow settings.
     */
    plugin: ITokenPlugin;
    /**
     * Network of the DAO.
     */
    network: Network;
    /**
     * Callback called on lock dialog close.
     */
    onLockDialogClose?: () => void;
    /**
     * Callback called when a refresh is needed, e.g., after an unlock or withdraw action.
     */
    onRefreshNeeded?: () => void;
}

const statusToVariant: Record<LockStatus, TagVariant> = {
    active: 'primary',
    cooldown: 'info',
    available: 'success',
};

export const TokenLockListItem: React.FC<ITokenLockListItemProps> = (props) => {
    const { lock, plugin, network, onLockDialogClose, onRefreshNeeded } = props;

    const { escrowAddress, nftLockAddress } = plugin.votingEscrow!;
    const { token, votingEscrow } = plugin.settings;
    const { amount, epochStartAt } = lock;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const { id: chainId } = networkDefinitions[network];
    const status = tokenLocksDialogUtils.getLockStatus(lock);

    const needsApproval = useNftNeedsApproval({
        spender: escrowAddress as Hex,
        tokenAddress: nftLockAddress as Hex,
        tokenId: BigInt(lock.tokenId),
        chainId,
        enabled: status === 'active',
    });

    const handleUnlockSuccess = () => {
        onLockDialogClose?.();
        onRefreshNeeded?.();
    };

    const handleUnlock = () => {
        const dialogProps = {
            action: 'unlock' as const,
            escrowContract: escrowAddress,
            network,
            token,
            tokenId: BigInt(lock.tokenId),
            onClose: onLockDialogClose,
            onSuccessClick: handleUnlockSuccess,
        };

        if (needsApproval) {
            const approveParams: ITokenApproveNftDialogParams = {
                tokenAddress: nftLockAddress as Hex,
                tokenId: BigInt(lock.tokenId),
                tokenName: lock.nft.name,
                spender: escrowAddress as Hex,
                network,
                translationNamespace: 'UNLOCK',
                onClose: onLockDialogClose,
                onApproveSuccess: () => {
                    const unlockParams: ITokenLockUnlockDialogParams = { ...dialogProps, showTransactionInfo: true };
                    open(TokenPluginDialogId.LOCK_UNLOCK, { params: unlockParams });
                },
                transactionInfo: {
                    title: t('app.plugins.token.tokenLockList.item.approveTransactionInfoTitle', {
                        tokenId: lock.tokenId,
                    }),
                    current: 1,
                    total: 2,
                },
            };
            open(TokenPluginDialogId.APPROVE_NFT, { params: approveParams });
        } else {
            // Show unlock dialog directly
            const unlockParams: ITokenLockUnlockDialogParams = { ...dialogProps, showTransactionInfo: false };
            open(TokenPluginDialogId.LOCK_UNLOCK, { params: unlockParams });
        }
    };

    const handleWithdraw = () => {
        const withdrawParams: ITokenLockUnlockDialogParams = {
            action: 'withdraw',
            escrowContract: escrowAddress,
            network,
            token,
            tokenId: BigInt(lock.tokenId),
            onClose: onLockDialogClose,
            onSuccessClick: () => {
                onLockDialogClose?.();
                onRefreshNeeded?.();
            },
            showTransactionInfo: false,
        };
        open(TokenPluginDialogId.LOCK_UNLOCK, { params: withdrawParams });
    };

    const minLockTime = epochStartAt + (votingEscrow?.minLockTime ?? 0);
    const canUnlock = DateTime.now().toSeconds() > minLockTime;
    const formattedMinLock = formatterUtils.formatDate(minLockTime * 1000, { format: DateFormat.DURATION });

    const parsedExitDate = (lock.lockExit.exitDateAt ?? 0) * 1000;
    const formattedExitDate = formatterUtils.formatDate(parsedExitDate, { format: DateFormat.DURATION });

    const parsedLockedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedLockedAmount = formatterUtils.formatNumber(parsedLockedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const multiplier = tokenLocksDialogUtils.getMultiplier(lock, plugin.settings);
    const formattedMultiplier = formatterUtils.formatNumber(multiplier.toString(), {
        format: NumberFormat.GENERIC_SHORT,
    });

    return (
        <DataList.Item className="flex flex-col gap-4 py-4 md:py-6">
            <div className="flex justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                    <Avatar src={token.logo} size="md" className="shrink-0" />
                    <Heading size="h4">ID: {lock.tokenId}</Heading>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    {status === 'cooldown' && (
                        <p className="text-sm leading-tight text-neutral-500 md:text-base">
                            {formattedExitDate} {t('app.plugins.token.tokenLockList.item.timeLeftSuffix')}
                        </p>
                    )}
                    <Tag
                        label={t(`app.plugins.token.tokenLockList.item.statusLabel.${status}`)}
                        variant={statusToVariant[status]}
                    />
                </div>
            </div>
            <hr className="border-neutral-100" />
            <div className="grid grid-cols-3 gap-4 text-base leading-tight text-neutral-800 md:text-lg">
                <div className="flex flex-col">
                    <div className="text-sm text-neutral-500 md:text-base">
                        {t('app.plugins.token.tokenLockList.item.metrics.locked')}
                    </div>
                    <div className="truncate">{formattedLockedAmount}</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-sm text-neutral-500 md:text-base">
                        {t('app.plugins.token.tokenLockList.item.metrics.multiplier')}
                    </div>
                    <div className="truncate">{`${formattedMultiplier!}x`}</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-sm text-neutral-500 md:text-base">
                        {t('app.plugins.token.tokenLockList.item.metrics.votingPower')}
                    </div>
                    <div className="truncate">
                        {status === 'active' && (
                            <Rerender>
                                {() => (
                                    <NumberFlow
                                        className="w-full"
                                        value={parseFloat(
                                            tokenLocksDialogUtils.getLockVotingPower(lock, plugin.settings),
                                        )}
                                        format={{ notation: 'compact', minimumFractionDigits: 4 }}
                                        trend={-1}
                                    />
                                )}
                            </Rerender>
                        )}
                        {status != 'active' && '0'}
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                {status === 'active' && (
                    <>
                        <Button
                            className="w-full md:w-auto"
                            variant="secondary"
                            size="md"
                            disabled={!canUnlock}
                            onClick={handleUnlock}
                        >
                            {t(`app.plugins.token.tokenLockList.item.actions.unlock`, {
                                underlyingSymbol: token.symbol,
                            })}
                        </Button>
                        {!canUnlock && (
                            <p className="text-sm leading-normal text-neutral-500">
                                {formattedMinLock} {t('app.plugins.token.tokenLockList.item.minLockTimeLeftSuffix')}
                            </p>
                        )}
                    </>
                )}
                {status === 'cooldown' && (
                    <>
                        <Button className="w-full md:w-auto" variant="tertiary" size="md" disabled={true}>
                            {t(`app.plugins.token.tokenLockList.item.actions.withdraw`, {
                                underlyingSymbol: token.symbol,
                            })}
                        </Button>
                        <p className="text-sm leading-normal text-neutral-500">
                            {formattedExitDate} {t('app.plugins.token.tokenLockList.item.withdrawTimeLeftSuffix')}
                        </p>
                    </>
                )}
                {status === 'available' && (
                    <Button className="w-full md:w-auto" variant="tertiary" size="md" onClick={handleWithdraw}>
                        {t(`app.plugins.token.tokenLockList.item.actions.withdraw`, { underlyingSymbol: token.symbol })}
                    </Button>
                )}
            </div>
        </DataList.Item>
    );
};
