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
import type { IMemberLock } from '@/plugins/gaugeVoterPlugin/api/locksService';
import {
    type TokenLockStatus,
    tokenLockUtils,
} from '@/plugins/tokenPlugin/components/tokenMemberPanel/tokenLock/tokenLockUtils';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveNftDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveNftDialog';
import { useTokenExitQueueFeeData } from '@/plugins/tokenPlugin/hooks/useTokenExitQueueFeeData';
import type { IDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useCheckNftAllowance } from '../../../tokenPlugin/components/tokenMemberPanel/hooks/useCheckNftAllowance';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterExitQueueWithdrawDialogParams } from '../../dialogs/gaugeVoterExitQueueWithdrawDialog';
import type { IGaugeVoterLockUnlockDialogParams } from '../../dialogs/gaugeVoterLockUnlockDialog';
import type { IGaugeVoterPlugin } from '../../types';
import { gaugeVoterExitQueueFeeUtils } from '../../utils/gaugeVoterExitQueueFeeUtils';

/**
 * Props for the GaugeVoterLockListItem component.
 */
export interface IGaugeVoterLockListItemProps {
    /**
     * VE lock to display.
     */
    lock: IMemberLock;
    /**
     * Gauge voter plugin containing voting escrow settings.
     */
    plugin: IGaugeVoterPlugin;
    /**
     * DAO with the gauge-voter plugin.
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

export const GaugeVoterLockListItem: React.FC<IGaugeVoterLockListItemProps> = (
    props,
) => {
    const { lock, plugin, dao, onRefreshNeeded } = props;

    const votingEscrowConfig = plugin.votingEscrow;
    const escrowAddress = votingEscrowConfig?.escrowAddress ?? zeroAddress;
    const nftLockAddress = votingEscrowConfig?.nftLockAddress ?? zeroAddress;
    const exitQueueAddress = votingEscrowConfig?.exitQueueAddress;
    const { token, votingEscrow } = plugin.settings;
    const { amount, epochStartAt } = lock;

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
    const pluginMinFeePercent =
        plugin.settings.votingEscrow?.minFeePercent ?? 0;

    const effectiveQueuedAtPreCheck = lock.lockExit.queuedAt ?? null;
    const effectiveMinCooldownPreCheck = lock.lockExit.minCooldown ?? null;
    const minCooldownTimestampPreCheck =
        effectiveQueuedAtPreCheck != null &&
        effectiveMinCooldownPreCheck != null
            ? effectiveQueuedAtPreCheck + effectiveMinCooldownPreCheck
            : null;

    const nowSeconds = DateTime.now().toSeconds();
    const secondsUntilMinCooldown =
        minCooldownTimestampPreCheck != null
            ? minCooldownTimestampPreCheck - nowSeconds
            : null;

    const getRefetchInterval = () => {
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

    const {
        ticket,
        feeAmount,
        canExit,
        isLoading: isFeeDataLoading,
    } = useTokenExitQueueFeeData({
        tokenId: BigInt(lock.tokenId),
        lockManagerAddress,
        chainId,
        enabled:
            hasExitQueue &&
            (baseStatus === 'cooldown' || baseStatus === 'available'),
        refetchInterval: getRefetchInterval(),
    });

    const effectiveQueuedAt =
        lock.lockExit.queuedAt ?? ticket?.queuedAt ?? null;
    const effectiveMinCooldown =
        lock.lockExit.minCooldown ?? ticket?.minCooldown ?? null;

    const minCooldownTimestamp =
        effectiveQueuedAt != null && effectiveMinCooldown != null
            ? effectiveQueuedAt + effectiveMinCooldown
            : null;

    const status: TokenLockStatus = lock.lockExit.status
        ? canExit
            ? 'available'
            : 'cooldown'
        : 'active';

    const openViewLocksDialog = () =>
        open(GaugeVoterPluginDialogId.VIEW_LOCKS, { params: { dao, plugin } });

    const handleActionSuccess = () => {
        openViewLocksDialog();
        onRefreshNeeded?.();
    };

    const handleUnlock = () => {
        const dialogProps = {
            action: 'unlock' as const,
            dao,
            escrowContract: escrowAddress,
            network: dao.network,
            token,
            tokenId: BigInt(lock.tokenId),
            lockAmount: BigInt(amount),
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
                    const unlockParams: IGaugeVoterLockUnlockDialogParams = {
                        ...dialogProps,
                        showTransactionInfo: true,
                    };
                    open(GaugeVoterPluginDialogId.LOCK_UNLOCK, {
                        params: unlockParams,
                    });
                },
                transactionInfo: {
                    title: t(
                        'app.plugins.token.tokenLockList.item.approveTransactionInfoTitle',
                        {
                            tokenId: lock.tokenId,
                        },
                    ),
                    current: 1,
                    total: 2,
                },
            };
            open(TokenPluginDialogId.APPROVE_NFT, { params: approveParams });
        } else {
            const unlockParams: IGaugeVoterLockUnlockDialogParams = {
                ...dialogProps,
                showTransactionInfo: false,
            };
            open(GaugeVoterPluginDialogId.LOCK_UNLOCK, {
                params: unlockParams,
            });
        }
    };

    const handleWithdraw = () => {
        const hasConfiguredFees =
            gaugeVoterExitQueueFeeUtils.shouldShowFeeDialog({
                feePercent: ticket?.feePercent ?? pluginFeePercent,
                minFeePercent: ticket?.minFeePercent ?? pluginMinFeePercent,
            });
        const shouldShowFeeDialog =
            exitQueueAddress != null && ticket != null && hasConfiguredFees;

        if (shouldShowFeeDialog) {
            const dialogParams: IGaugeVoterExitQueueWithdrawDialogParams = {
                tokenId: BigInt(lock.tokenId),
                token,
                lockManagerAddress: exitQueueAddress as Hex,
                escrowAddress: escrowAddress as Hex,
                ticket,
                lockedAmount: BigInt(amount),
                feeAmount,
                network: dao.network,
                onBack: openViewLocksDialog,
                onSuccess: handleActionSuccess,
            };
            open(GaugeVoterPluginDialogId.EXIT_QUEUE_WITHDRAW_FEE, {
                params: dialogParams,
            });
        } else {
            const dialogParams: IGaugeVoterLockUnlockDialogParams = {
                action: 'withdraw',
                dao,
                escrowContract: escrowAddress,
                token,
                tokenId: BigInt(lock.tokenId),
                lockAmount: BigInt(amount),
                onClose: openViewLocksDialog,
                onSuccessClick: handleActionSuccess,
                showTransactionInfo: false,
            };
            open(GaugeVoterPluginDialogId.LOCK_UNLOCK, {
                params: dialogParams,
            });
        }
    };

    const minLockTime = epochStartAt + (votingEscrow?.minLockTime ?? 0);
    const canUnlock = nowSeconds > minLockTime;
    const formattedMinLock = formatterUtils.formatDate(minLockTime * 1000, {
        format: DateFormat.DURATION,
    });

    const parsedLockedAmount = formatUnits(BigInt(amount), token.decimals);
    const formattedLockedAmount = formatterUtils.formatNumber(
        parsedLockedAmount,
        {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        },
    );

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

                <Tag
                    label={t(
                        `app.plugins.token.tokenLockList.item.statusLabel.${status}`,
                    )}
                    variant={statusToVariant[status]}
                />
            </div>
            <hr className="border-neutral-100" />
            <div className="grid grid-cols-3 gap-4 text-base text-neutral-800 leading-tight md:text-lg">
                <div className="flex flex-col">
                    <div className="text-neutral-500 text-sm md:text-base">
                        {t(
                            'app.plugins.token.tokenLockList.item.metrics.locked',
                        )}
                    </div>
                    <div className="truncate">{formattedLockedAmount}</div>
                </div>
                <div className="flex flex-col">
                    <div className="text-neutral-500 text-sm md:text-base">
                        {t(
                            'app.plugins.token.tokenLockList.item.metrics.multiplier',
                        )}
                    </div>
                    <div className="truncate">
                        {formattedMultiplier ? `${formattedMultiplier}x` : '-'}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="text-neutral-500 text-sm md:text-base">
                        {t(
                            'app.plugins.token.tokenLockList.item.metrics.votingPower',
                        )}
                    </div>
                    {status === 'active' && (
                        <Rerender>
                            {() => (
                                <NumberFlow
                                    format={{
                                        notation: 'compact',
                                        minimumFractionDigits: 4,
                                    }}
                                    trend={-1}
                                    value={Number.parseFloat(
                                        tokenLockUtils.getLockVotingPower(
                                            lock,
                                            plugin.settings,
                                        ),
                                    )}
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
                            disabled={!canUnlock}
                            onClick={handleUnlock}
                            size="md"
                            variant="secondary"
                        >
                            {t(
                                'app.plugins.token.tokenLockList.item.actions.unlock',
                                { symbol: token.symbol },
                            )}
                        </Button>
                        {!canUnlock && (
                            <p className="text-neutral-500 text-sm leading-normal">
                                {formattedMinLock}{' '}
                                {t(
                                    'app.plugins.token.tokenLockList.item.minLockTimeLeftSuffix',
                                )}
                            </p>
                        )}
                    </>
                )}

                {lock.lockExit.status && (
                    <>
                        <Button
                            className="w-full md:w-auto"
                            disabled={status === 'cooldown'}
                            onClick={
                                status === 'cooldown'
                                    ? undefined
                                    : handleWithdraw
                            }
                            size="md"
                            variant="tertiary"
                        >
                            {t(
                                'app.plugins.token.tokenLockList.item.actions.withdraw',
                                { symbol: token.symbol },
                            )}
                        </Button>

                        {status === 'cooldown' && !isFeeDataLoading && (
                            <Rerender intervalDuration={60_000}>
                                {() => {
                                    const formattedMinCooldownDate =
                                        minCooldownTimestamp != null
                                            ? formatterUtils.formatDate(
                                                  minCooldownTimestamp * 1000,
                                                  {
                                                      format: DateFormat.DURATION,
                                                  },
                                              )
                                            : undefined;

                                    return (
                                        <p className="text-neutral-500 text-sm leading-normal">
                                            {formattedMinCooldownDate}{' '}
                                            {t(
                                                'app.plugins.token.tokenLockList.item.withdrawTimeLeftSuffix',
                                            )}
                                        </p>
                                    );
                                }}
                            </Rerender>
                        )}
                    </>
                )}
            </div>
        </DataList.Item>
    );
};
