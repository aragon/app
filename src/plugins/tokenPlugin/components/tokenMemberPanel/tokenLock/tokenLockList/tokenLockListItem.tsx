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
import { formatUnits, type Hex, zeroAddress } from 'viem';
import type { ITokenExitQueueWithdrawDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenExitQueueWithdrawDialog/tokenExitQueueWithdrawDialog.api';
import { useTokenExitQueueFeeData } from '@/plugins/tokenPlugin/hooks/useTokenExitQueueFeeData';
import { tokenExitQueueFeeUtils } from '@/plugins/tokenPlugin/utils/tokenExitQueueFeeUtils';
import type { IDao } from '@/shared/api/daoService';
import type { IDialogContext } from '@/shared/components/dialogProvider';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import type { IMemberLock } from '../../../../api/tokenService';
import { TokenPluginDialogId } from '../../../../constants/tokenPluginDialogId';
import type { ITokenApproveNftDialogParams } from '../../../../dialogs/tokenApproveNftDialog';
import type { ITokenLockUnlockDialogParams } from '../../../../dialogs/tokenLockUnlockDialog';
import type { ITokenExitQueueTicket, ITokenPlugin } from '../../../../types';
import { useCheckNftAllowance } from '../../hooks/useCheckNftAllowance';
import { type TokenLockStatus, tokenLockUtils } from '../tokenLockUtils';

/**
 * Props for the TokenLockListItem component.
 */
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

type TranslateFn = ReturnType<typeof useTranslations>['t'];

const computeRefetchInterval = (baseStatus: TokenLockStatus, secondsUntilMinCooldown: number | null) => {
    if (baseStatus !== 'cooldown') {
        return;
    }
    if (secondsUntilMinCooldown == null) {
        return 10_000;
    }

    if (secondsUntilMinCooldown <= 30) {
        return 1000;
    }
    if (secondsUntilMinCooldown <= 120) {
        return 5000;
    }
    return 10_000;
};

const computeStatus = (lock: IMemberLock, canExit: boolean): TokenLockStatus => {
    if (!lock.lockExit.status) {
        return 'active';
    }

    return canExit ? 'available' : 'cooldown';
};

const getSecondsUntilMinCooldown = (lock: IMemberLock, nowSeconds: number): number | null => {
    const queuedAt = lock.lockExit.queuedAt ?? null;
    const minCooldown = lock.lockExit.minCooldown ?? null;

    if (queuedAt == null || minCooldown == null) {
        return null;
    }

    return queuedAt + minCooldown - nowSeconds;
};

type LockTimingData = {
    secondsUntilMinCooldown: number | null;
    minCooldownTimestamp: number | null;
    minLockTime: number;
    canUnlock: boolean;
    formattedMinLock: string;
};

const buildLockTimingData = (params: {
    lock: IMemberLock;
    votingEscrow?: ITokenPlugin['settings']['votingEscrow'];
    ticket?: ITokenExitQueueTicket;
    nowSeconds: number;
}) => {
    const { lock, votingEscrow, ticket, nowSeconds } = params;

    const effectiveQueuedAtPreCheck = lock.lockExit.queuedAt ?? null;
    const effectiveMinCooldownPreCheck = lock.lockExit.minCooldown ?? null;
    const minCooldownTimestampPreCheck =
        effectiveQueuedAtPreCheck != null && effectiveMinCooldownPreCheck != null
            ? effectiveQueuedAtPreCheck + effectiveMinCooldownPreCheck
            : null;

    const secondsUntilMinCooldown = minCooldownTimestampPreCheck != null ? minCooldownTimestampPreCheck - nowSeconds : null;

    const effectiveQueuedAt = lock.lockExit.queuedAt ?? ticket?.queuedAt ?? null;
    const effectiveMinCooldown = lock.lockExit.minCooldown ?? ticket?.minCooldown ?? null;
    const minCooldownTimestamp =
        effectiveQueuedAt != null && effectiveMinCooldown != null ? effectiveQueuedAt + effectiveMinCooldown : null;

    const minLockTime = lock.epochStartAt + (votingEscrow?.minLockTime ?? 0);
    const canUnlock = nowSeconds > minLockTime;
    const formattedMinLock = formatterUtils.formatDate(minLockTime * 1000, {
        format: DateFormat.DURATION,
    });

    return { secondsUntilMinCooldown, minCooldownTimestamp, minLockTime, canUnlock, formattedMinLock } satisfies LockTimingData;
};

type UnlockHandlerParams = {
    lock: IMemberLock;
    dao: IDao;
    token: ITokenPlugin['settings']['token'];
    escrowAddress: Hex;
    nftLockAddress: Hex;
    needsApproval: boolean;
    open: IDialogContext['open'];
    t: ReturnType<typeof useTranslations>['t'];
    openViewLocksDialog: () => void;
    onActionSuccess: () => void;
};

const openUnlockFlow = (params: UnlockHandlerParams) => {
    const { lock, dao, token, escrowAddress, nftLockAddress, needsApproval, open, t, openViewLocksDialog, onActionSuccess } = params;
    const baseDialogParams = {
        action: 'unlock' as const,
        dao,
        escrowContract: escrowAddress,
        network: dao.network,
        token,
        tokenId: BigInt(lock.tokenId),
        lockAmount: BigInt(lock.amount),
        onClose: openViewLocksDialog,
        onSuccessClick: onActionSuccess,
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
                const unlockParams: ITokenLockUnlockDialogParams = {
                    ...baseDialogParams,
                    showTransactionInfo: true,
                };
                open(TokenPluginDialogId.LOCK_UNLOCK, {
                    params: unlockParams,
                });
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
        return;
    }

    const unlockParams: ITokenLockUnlockDialogParams = {
        ...baseDialogParams,
        showTransactionInfo: false,
    };
    open(TokenPluginDialogId.LOCK_UNLOCK, { params: unlockParams });
};

type WithdrawHandlerParams = {
    lock: IMemberLock;
    dao: IDao;
    token: ITokenPlugin['settings']['token'];
    exitQueueAddress?: string;
    ticket?: ITokenExitQueueTicket;
    feeAmount: bigint;
    pluginFeePercent: number;
    pluginMinFeePercent: number;
    open: IDialogContext['open'];
    openViewLocksDialog: () => void;
    onActionSuccess: () => void;
    escrowAddress: Hex;
};

const openWithdrawFlow = (params: WithdrawHandlerParams) => {
    const {
        lock,
        dao,
        token,
        exitQueueAddress,
        ticket,
        feeAmount,
        pluginFeePercent,
        pluginMinFeePercent,
        open,
        openViewLocksDialog,
        onActionSuccess,
        escrowAddress,
    } = params;

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
            escrowAddress: escrowAddress as Hex,
            ticket,
            lockedAmount: BigInt(lock.amount),
            feeAmount,
            network: dao.network,
            onBack: openViewLocksDialog,
            onSuccess: onActionSuccess,
        };
        open(TokenPluginDialogId.EXIT_QUEUE_WITHDRAW_FEE, {
            params: dialogParams,
        });
        return;
    }

    const dialogParams: ITokenLockUnlockDialogParams = {
        action: 'withdraw',
        dao,
        escrowContract: escrowAddress,
        token,
        tokenId: BigInt(lock.tokenId),
        lockAmount: BigInt(lock.amount),
        onClose: openViewLocksDialog,
        onSuccessClick: onActionSuccess,
        showTransactionInfo: false,
    };
    open(TokenPluginDialogId.LOCK_UNLOCK, { params: dialogParams });
};

type TokenLockMetricsProps = {
    formattedLockedAmount: string;
    formattedMultiplier: string;
    status: TokenLockStatus;
    lock: IMemberLock;
    pluginSettings: ITokenPlugin['settings'];
    t: TranslateFn;
};

const TokenLockMetrics: React.FC<TokenLockMetricsProps> = (props) => {
    const { formattedLockedAmount, formattedMultiplier, status, lock, pluginSettings, t } = props;

    return (
        <div className="grid grid-cols-3 gap-4 text-base text-neutral-800 leading-tight md:text-lg">
            <div className="flex flex-col">
                <div className="text-neutral-500 text-sm md:text-base">{t('app.plugins.token.tokenLockList.item.metrics.locked')}</div>
                <div className="truncate">{formattedLockedAmount}</div>
            </div>
            <div className="flex flex-col">
                <div className="text-neutral-500 text-sm md:text-base">{t('app.plugins.token.tokenLockList.item.metrics.multiplier')}</div>
                <div className="truncate">{formattedMultiplier ? `${formattedMultiplier}x` : '-'}</div>
            </div>
            <div className="flex flex-col">
                <div className="text-neutral-500 text-sm md:text-base">{t('app.plugins.token.tokenLockList.item.metrics.votingPower')}</div>
                {status === 'active' && (
                    <Rerender>
                        {() => (
                            <NumberFlow
                                format={{
                                    notation: 'compact',
                                    minimumFractionDigits: 4,
                                }}
                                trend={-1}
                                value={Number.parseFloat(tokenLockUtils.getLockVotingPower(lock, pluginSettings))}
                            />
                        )}
                    </Rerender>
                )}
                {status !== 'active' && '0'}
            </div>
        </div>
    );
};

type TokenLockActionsProps = {
    status: TokenLockStatus;
    canUnlock: boolean;
    formattedMinLock: string;
    tokenSymbol: string;
    handleUnlock: () => void;
    handleWithdraw: () => void;
    minCooldownTimestamp: number | null;
    isFeeDataLoading: boolean;
    t: TranslateFn;
    hasExitRequest: boolean;
};

const TokenLockActions: React.FC<TokenLockActionsProps> = (props) => {
    const {
        status,
        canUnlock,
        formattedMinLock,
        tokenSymbol,
        handleUnlock,
        handleWithdraw,
        minCooldownTimestamp,
        isFeeDataLoading,
        t,
        hasExitRequest,
    } = props;

    return (
        <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
            {status === 'active' && (
                <>
                    <Button className="w-full md:w-auto" disabled={!canUnlock} onClick={handleUnlock} size="md" variant="secondary">
                        {t('app.plugins.token.tokenLockList.item.actions.unlock', {
                            symbol: tokenSymbol,
                        })}
                    </Button>
                    {!canUnlock && (
                        <p className="text-neutral-500 text-sm leading-normal">
                            {formattedMinLock} {t('app.plugins.token.tokenLockList.item.minLockTimeLeftSuffix')}
                        </p>
                    )}
                </>
            )}

            {hasExitRequest && status !== 'active' && (
                <>
                    <Button
                        className="w-full md:w-auto"
                        disabled={status === 'cooldown'}
                        onClick={status === 'cooldown' ? undefined : handleWithdraw}
                        size="md"
                        variant="tertiary"
                    >
                        {t('app.plugins.token.tokenLockList.item.actions.withdraw', {
                            symbol: tokenSymbol,
                        })}
                    </Button>

                    {status === 'cooldown' && !isFeeDataLoading && (
                        <Rerender intervalDuration={60_000}>
                            {() => {
                                const formattedMinCooldownDate =
                                    minCooldownTimestamp != null
                                        ? formatterUtils.formatDate(minCooldownTimestamp * 1000, {
                                              format: DateFormat.DURATION,
                                          })
                                        : undefined;

                                return (
                                    <p className="text-neutral-500 text-sm leading-normal">
                                        {formattedMinCooldownDate} {t('app.plugins.token.tokenLockList.item.withdrawTimeLeftSuffix')}
                                    </p>
                                );
                            }}
                        </Rerender>
                    )}
                </>
            )}
        </div>
    );
};

export const TokenLockListItem: React.FC<ITokenLockListItemProps> = (props) => {
    const { lock, plugin, dao, onRefreshNeeded } = props;

    const votingEscrowConfig = plugin.votingEscrow;
    const escrowAddress = votingEscrowConfig?.escrowAddress ?? zeroAddress;
    const nftLockAddress = votingEscrowConfig?.nftLockAddress ?? zeroAddress;
    const exitQueueAddress = votingEscrowConfig?.exitQueueAddress;
    const { token, votingEscrow } = plugin.settings;
    const { amount } = lock;

    const { t } = useTranslations();
    const { open } = useDialogContext();

    const baseStatus = tokenLockUtils.getLockStatus(lock);
    const { needsApproval } = useCheckNftAllowance({
        spender: escrowAddress,
        nft: nftLockAddress,
        nftId: BigInt(lock.tokenId),
        network: dao.network,
        enabled: baseStatus === 'active',
    });

    const { id: chainId } = networkDefinitions[dao.network];
    const hasExitQueue = exitQueueAddress != null;
    const lockManagerAddress = (exitQueueAddress ?? zeroAddress) as Hex;

    const pluginFeePercent = plugin.settings.votingEscrow?.feePercent ?? 0;
    const pluginMinFeePercent = plugin.settings.votingEscrow?.minFeePercent ?? 0;

    const nowSeconds = DateTime.now().toSeconds();
    const refetchInterval = computeRefetchInterval(baseStatus, getSecondsUntilMinCooldown(lock, nowSeconds));

    const {
        ticket,
        feeAmount,
        canExit,
        isLoading: isFeeDataLoading,
    } = useTokenExitQueueFeeData({
        tokenId: BigInt(lock.tokenId),
        lockManagerAddress,
        chainId,
        enabled: hasExitQueue && (baseStatus === 'cooldown' || baseStatus === 'available'),
        refetchInterval,
    });

    const { minCooldownTimestamp, canUnlock, formattedMinLock } = buildLockTimingData({
        lock,
        votingEscrow,
        ticket,
        nowSeconds,
    });

    const status = computeStatus(lock, canExit);

    const openViewLocksDialog = () => open(TokenPluginDialogId.VIEW_LOCKS, { params: { dao, plugin } });

    const handleActionSuccess = () => {
        openViewLocksDialog();
        onRefreshNeeded?.();
    };

    const handleUnlock = () =>
        openUnlockFlow({
            lock,
            dao,
            token,
            escrowAddress,
            nftLockAddress: nftLockAddress as Hex,
            needsApproval,
            open,
            t,
            openViewLocksDialog,
            onActionSuccess: handleActionSuccess,
        });

    const handleWithdraw = () =>
        openWithdrawFlow({
            lock,
            dao,
            token,
            exitQueueAddress,
            ticket,
            feeAmount,
            pluginFeePercent,
            pluginMinFeePercent,
            open,
            openViewLocksDialog,
            onActionSuccess: handleActionSuccess,
            escrowAddress,
        });

    const parsedLockedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedLockedAmount = formatterUtils.formatNumber(parsedLockedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const multiplier = tokenLockUtils.getMultiplier(lock, plugin.settings);
    const formattedMultiplier =
        formatterUtils.formatNumber(multiplier.toString(), {
            format: NumberFormat.GENERIC_SHORT,
        }) ?? '';

    return (
        <DataList.Item className="flex flex-col gap-4 py-4 md:py-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                    <Avatar className="shrink-0" size="md" src={token.logo} />
                    <Heading size="h4">ID: {lock.tokenId}</Heading>
                </div>

                <Tag label={t(`app.plugins.token.tokenLockList.item.statusLabel.${status}`)} variant={statusToVariant[status]} />
            </div>
            <hr className="border-neutral-100" />
            <TokenLockMetrics
                formattedLockedAmount={formattedLockedAmount}
                formattedMultiplier={formattedMultiplier}
                lock={lock}
                pluginSettings={plugin.settings}
                status={status}
                t={t}
            />
            <TokenLockActions
                canUnlock={canUnlock}
                formattedMinLock={formattedMinLock}
                handleUnlock={handleUnlock}
                handleWithdraw={handleWithdraw}
                hasExitRequest={lock.lockExit.status}
                isFeeDataLoading={isFeeDataLoading}
                minCooldownTimestamp={minCooldownTimestamp}
                status={status}
                t={t}
                tokenSymbol={token.symbol}
            />
        </DataList.Item>
    );
};
