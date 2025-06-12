import type { Network } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import {
    Avatar,
    Button,
    DataList,
    DateFormat,
    formatterUtils,
    Heading,
    NumberFormat,
    Tag,
    type TagVariant,
} from '@aragon/gov-ui-kit';
import { DateTime } from 'luxon';
import { erc721Abi, formatUnits, type Hex } from 'viem';
import { useReadContract } from 'wagmi';
import type { IMemberLock } from '../../../api/tokenService';
import { TokenPluginDialogId } from '../../../constants/tokenPluginDialogId';
import type { ITokenApproveNftDialogParams } from '../../../dialogs/tokenApproveNftDialog';
import type { ITokenLockUnlockDialogParams } from '../../../dialogs/tokenLockUnlockDialog';
import type { LockStatus } from '../../../dialogs/tokenLocksDialog/tokenLocksDialog';
import { tokenLocksDialogUtils } from '../../../dialogs/tokenLocksDialog/tokenLocksDialogUtils';
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
}

const statusToVariant: Record<LockStatus, TagVariant> = {
    active: 'primary',
    cooldown: 'info',
    available: 'success',
};

export const TokenLockListItem: React.FC<ITokenLockListItemProps> = (props) => {
    const { lock, plugin, network, onLockDialogClose } = props;
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const token = plugin.settings.token;

    const { status, timeLeft } = tokenLocksDialogUtils.getLockStatusAndTiming(lock);
    const { amount } = lock;
    const { multiplier, votingPower } = tokenLocksDialogUtils.getMultiplierAndVotingPower(lock);
    const minLockTime = tokenLocksDialogUtils.getMinLockTime(lock, plugin.settings.votingEscrow!);
    const now = DateTime.now().toSeconds();

    // Check if the NFT is approved for the escrow contract
    const { data: approvedAddress } = useReadContract({
        abi: erc721Abi,
        address: plugin.votingEscrow!.nftLockAddress as Hex,
        functionName: 'getApproved',
        args: [BigInt(lock.tokenId)],
        query: { enabled: status === 'active' },
    });

    const needsApproval = status === 'active' && approvedAddress !== plugin.votingEscrow!.escrowAddress;

    const handleUnlock = () => {
        if (needsApproval) {
            const approveParams: ITokenApproveNftDialogParams = {
                tokenAddress: plugin.votingEscrow!.nftLockAddress as Hex,
                tokenId: BigInt(lock.tokenId),
                tokenName: lock.nft.name,
                spender: plugin.votingEscrow!.escrowAddress as Hex,
                network,
                translationNamespace: 'UNLOCK',
                onClose: onLockDialogClose,
                onApproveSuccess: () => {
                    const unlockParams: ITokenLockUnlockDialogParams = {
                        action: 'unlock',
                        amount: BigInt(amount),
                        escrowContract: plugin.votingEscrow!.escrowAddress,
                        network,
                        token,
                        tokenId: BigInt(lock.tokenId),
                        onClose: onLockDialogClose,
                        onSuccessClick: onLockDialogClose,
                        showTransactionInfo: true,
                    };

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
            open(TokenPluginDialogId.APPROVE_NFT, {
                params: approveParams,
            });
        } else {
            // Show unlock dialog directly
            const unlockParams: ITokenLockUnlockDialogParams = {
                action: 'unlock',
                escrowContract: plugin.votingEscrow!.escrowAddress,
                network,
                token,
                tokenId: BigInt(lock.tokenId),
                onClose: onLockDialogClose,
                onSuccessClick: onLockDialogClose,
                showTransactionInfo: false,
            };
            open(TokenPluginDialogId.LOCK_UNLOCK, {
                params: unlockParams,
            });
        }
    };

    const handleWithdraw = () => {
        const withdrawParams: ITokenLockUnlockDialogParams = {
            action: 'withdraw',
            escrowContract: plugin.votingEscrow!.escrowAddress,
            network,
            token,
            tokenId: BigInt(lock.tokenId),
            onClose: onLockDialogClose,
            onSuccessClick: onLockDialogClose,
            showTransactionInfo: false,
        };
        open(TokenPluginDialogId.LOCK_UNLOCK, {
            params: withdrawParams,
        });
    };

    const formattedLockedAmount = formatterUtils.formatNumber(formatUnits(BigInt(amount), token.decimals), {
        format: NumberFormat.GENERIC_SHORT,
    });
    const formattedVotingPower = formatterUtils.formatNumber(formatUnits(BigInt(votingPower), token.decimals), {
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
                    {timeLeft && (
                        <p className="text-sm leading-tight text-neutral-500 md:text-base">
                            {formatterUtils.formatDate(timeLeft * 1000, {
                                format: DateFormat.DURATION,
                            })}{' '}
                            {t('app.plugins.token.tokenLockList.item.timeLeftSuffix')}
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
                {[
                    {
                        label: t('app.plugins.token.tokenLockList.item.metrics.locked'),
                        value: formattedLockedAmount,
                    },
                    {
                        label: t('app.plugins.token.tokenLockList.item.metrics.multiplier'),
                        value: `${multiplier.toString()}x`,
                        hidden: multiplier <= 1,
                    },
                    {
                        label: t('app.plugins.token.tokenLockList.item.metrics.votingPower'),
                        value: formattedVotingPower,
                    },
                ]
                    .filter((metric) => !metric.hidden)
                    .map(({ label, value }) => (
                        <div key={label} className="flex flex-col">
                            <div className="text-sm text-neutral-500 md:text-base">{label}</div>
                            <div className="truncate">{value}</div>
                        </div>
                    ))}
            </div>
            <div className="flex flex-col items-center gap-3 md:flex-row md:gap-4">
                {status === 'active' && (
                    <>
                        <Button
                            className="w-full md:w-auto"
                            variant="secondary"
                            size="md"
                            disabled={now < minLockTime}
                            onClick={handleUnlock}
                        >
                            {t(`app.plugins.token.tokenLockList.item.actions.unlock`, {
                                underlyingSymbol: token.symbol,
                            })}
                        </Button>
                        {now < minLockTime && (
                            <p className="text-sm leading-normal text-neutral-500">
                                {formatterUtils.formatDate(minLockTime * 1000, {
                                    format: DateFormat.DURATION,
                                })}{' '}
                                {t('app.plugins.token.tokenLockList.item.minLockTimeLeftSuffix')}
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
                            {formatterUtils.formatDate(timeLeft! * 1000, {
                                format: DateFormat.DURATION,
                            })}{' '}
                            {t('app.plugins.token.tokenLockList.item.withdrawTimeLeftSuffix')}
                        </p>
                    </>
                )}
                {status === 'available' && (
                    <Button className="w-full md:w-auto" variant="tertiary" size="md" onClick={handleWithdraw}>
                        {t(`app.plugins.token.tokenLockList.item.actions.withdraw`, {
                            underlyingSymbol: token.symbol,
                        })}
                    </Button>
                )}
            </div>
        </DataList.Item>
    );
};
