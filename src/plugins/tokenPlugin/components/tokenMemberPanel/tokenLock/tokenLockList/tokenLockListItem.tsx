import type { IDao } from '@/shared/api/daoService';
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
import { formatUnits, zeroAddress, type Hex } from 'viem';
import type { IMemberLock } from '../../../../api/tokenService';
import { TokenPluginDialogId } from '../../../../constants/tokenPluginDialogId';
import type { ITokenApproveNftDialogParams } from '../../../../dialogs/tokenApproveNftDialog';

import type { ITokenLockUnlockDialogParams } from '../../../../dialogs/tokenLockUnlockDialog';

import type { ITokenPlugin } from '../../../../types';

import { ITokenExitQueueWithdrawDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenExitQueueWithdrawDialog/tokenExitQueueWithdrawDialog.api';
import { useTokenExitQueueFeeData } from '@/plugins/tokenPlugin/hooks/useTokenExitQueueFeeData';
import { tokenExitQueueFeeUtils } from '@/plugins/tokenPlugin/utils/tokenExitQueueFeeUtils';
import { useCheckNftAllowance } from '../../hooks/useCheckNftAllowance';
import { tokenLockUtils, type TokenLockStatus } from '../tokenLockUtils';

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
     * DAO with the token-voting plugin.
     */
    dao: IDao;
    /**
     * Callback called when a refresh is needed, e.g., after an unlock or withdraw action.
     */
    onRefreshNeeded?: () => void;
}

const statusToVariant: Record<TokenLockStatus, TagVariant> = {
    active: 'primary',
    cooldown: 'info',
    available: 'success',
};

export const TokenLockListItem: React.FC<ITokenLockListItemProps> = (props) => {
    const { lock, plugin, dao, onRefreshNeeded } = props;

    const votingEscrowConfig = plugin.votingEscrow;
    const escrowAddress = votingEscrowConfig?.escrowAddress ?? zeroAddress;
    const nftLockAddress = votingEscrowConfig?.nftLockAddress ?? zeroAddress;
    const exitQueueAddress = votingEscrowConfig?.exitQueueAddress;
    const { token, votingEscrow } = plugin.settings;
    const { amount, epochStartAt } = lock;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const status = tokenLockUtils.getLockStatus(lock);
    const { needsApproval } = useCheckNftAllowance({
        spender: escrowAddress,
        nft: nftLockAddress,
        nftId: BigInt(lock.tokenId),
        network: dao.network,
        enabled: status === 'active',
    });

    // Query fee data from DynamicExitQueue for withdraw action
    const { id: chainId } = networkDefinitions[dao.network];
    const hasExitQueue = exitQueueAddress != null;
    const lockManagerAddress = (exitQueueAddress ?? zeroAddress) as Hex;

    const pluginFeePercent = plugin.settings.votingEscrow?.feePercent ?? 0;
    const pluginMinFeePercent = plugin.settings.votingEscrow?.minFeePercent ?? 0;

    const { ticket, feeAmount } = useTokenExitQueueFeeData({
        tokenId: BigInt(lock.tokenId),
        lockManagerAddress,
        chainId,
        enabled: hasExitQueue && status === 'available',
    });

    const openViewLocksDialog = () => open(TokenPluginDialogId.VIEW_LOCKS, { params: { dao, plugin } });

    const handleActionSuccess = () => {
        openViewLocksDialog();
        onRefreshNeeded?.();
    };

    const handleUnlock = () => {
        const dialogProps = {
            action: 'unlock' as const,
            dao: dao,
            escrowContract: escrowAddress,
            network: dao.network,
            token,
            tokenId: BigInt(lock.tokenId),
            onClose: openViewLocksDialog,
            onSuccessClick: handleActionSuccess,
        };

        if (needsApproval) {
            const approveParams: ITokenApproveNftDialogParams = {
                tokenAddress: nftLockAddress as Hex,
                tokenId: BigInt(lock.tokenId),
                tokenName: lock.nft.name,
                spender: escrowAddress as Hex,
                network: dao.network,
                translationNamespace: 'UNLOCK',
                onClose: openViewLocksDialog,
                onSuccess: () => {
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
            const unlockParams: ITokenLockUnlockDialogParams = { ...dialogProps, showTransactionInfo: false };
            open(TokenPluginDialogId.LOCK_UNLOCK, { params: unlockParams });
        }
    };

    const handleWithdraw = () => {
        // Check if we have fee data and should show the fee-based withdraw dialog
        const hasConfiguredFees = tokenExitQueueFeeUtils.shouldShowFeeDialog({
            feePercent: ticket?.feePercent ?? pluginFeePercent,
            minFeePercent: ticket?.minFeePercent ?? pluginMinFeePercent,
        });
        const shouldShowFeeDialog = exitQueueAddress != null && ticket != null && hasConfiguredFees;

        if (shouldShowFeeDialog) {
            const dialogParams: ITokenExitQueueWithdrawDialogParams = {
                tokenId: BigInt(lock.tokenId),
                token,
                lockManagerAddress: exitQueueAddress as Hex,
                ticket,
                lockedAmount: BigInt(amount),
                feeAmount,
                network: dao.network,
                onBack: openViewLocksDialog,
                onSuccess: handleActionSuccess,
            };
            open(TokenPluginDialogId.EXIT_QUEUE_WITHDRAW_FEE, { params: dialogParams });
        } else {
            // Fall back to legacy withdraw dialog (no fees or data not available)
            const dialogParams: ITokenLockUnlockDialogParams = {
                action: 'withdraw',
                dao: dao,
                escrowContract: escrowAddress,
                token,
                tokenId: BigInt(lock.tokenId),
                onClose: openViewLocksDialog,
                onSuccessClick: handleActionSuccess,
                showTransactionInfo: false,
            };
            open(TokenPluginDialogId.LOCK_UNLOCK, { params: dialogParams });
        }
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

    const multiplier = tokenLockUtils.getMultiplier(lock, plugin.settings);
    const formattedMultiplier =
        formatterUtils.formatNumber(multiplier.toString(), { format: NumberFormat.GENERIC_SHORT }) ?? '';

    return (
        <DataList.Item className="flex flex-col gap-4 py-4 md:py-6">
            <div className="flex justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                    {/*TODO Revert to token.logo before merge DEMO ONLY*/}
                    <Avatar
                        src="https://pbs.twimg.com/profile_images/1937810644964716545/LDiOF-l0_400x400.jpg"
                        size="md"
                        className="shrink-0"
                    />
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
                    <div className="truncate">{formattedMultiplier ? `${formattedMultiplier}x` : '-'}</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-sm text-neutral-500 md:text-base">
                        {t('app.plugins.token.tokenLockList.item.metrics.votingPower')}
                    </div>
                    {status === 'active' && (
                        <Rerender>
                            {() => (
                                <NumberFlow
                                    value={parseFloat(tokenLockUtils.getLockVotingPower(lock, plugin.settings))}
                                    format={{ notation: 'compact', minimumFractionDigits: 4 }}
                                    trend={-1}
                                />
                            )}
                        </Rerender>
                    )}
                    {status !== 'active' && '0'}
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
                            {t(`app.plugins.token.tokenLockList.item.actions.unlock`, { symbol: token.symbol })}
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
                            {t(`app.plugins.token.tokenLockList.item.actions.withdraw`, { symbol: token.symbol })}
                        </Button>
                        <p className="text-sm leading-normal text-neutral-500">
                            {formattedExitDate} {t('app.plugins.token.tokenLockList.item.withdrawTimeLeftSuffix')}
                        </p>
                    </>
                )}

                {status === 'available' && (
                    <Button className="w-full md:w-auto" variant="tertiary" size="md" onClick={handleWithdraw}>
                        {t(`app.plugins.token.tokenLockList.item.actions.withdraw`, { symbol: token.symbol })}
                    </Button>
                )}
            </div>
        </DataList.Item>
    );
};
