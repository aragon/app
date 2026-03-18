import { Button, IconType, invariant } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useConnection } from 'wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import {
    AssetInput,
    type IAssetInputFormData,
} from '@/modules/finance/components/assetInput';
import { useMemberLocks } from '@/plugins/gaugeVoterPlugin/api/locksService';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import { useOpenDelegationOnboardingIfNeeded } from '@/plugins/tokenPlugin/hooks/useOpenDelegationOnboardingIfNeeded';
import { useTokenCheckTokenAllowance } from '@/plugins/tokenPlugin/hooks/useTokenCheckTokenAllowance';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { FooterInfo } from '@/shared/components/footerInfo';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useIsMounted } from '@/shared/hooks/useIsMounted';
import { GaugeVoterPluginDialogId } from '../../constants/gaugeVoterPluginDialogId';
import type { IGaugeVoterLocksDialogParams } from '../../dialogs/gaugeVoterLocksDialog';
import type { IGaugeVoterLockUnlockDialogParams } from '../../dialogs/gaugeVoterLockUnlockDialog';
import type { IGaugeVoterPlugin } from '../../types';
import { GaugeVoterLockFormChart } from './gaugeVoterLockFormChart';

/**
 * Props for the GaugeVoterLockForm component.
 */
export interface IGaugeVoterLockFormProps {
    /**
     * DAO plugin for the token locking.
     */
    plugin: IGaugeVoterPlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Rendering mode: 'panel' (default) or 'dialog'.
     */
    mode?: 'panel' | 'dialog';
    /**
     * Callback invoked when the user cancels (dialog mode only).
     */
    onCancel?: () => void;
}

/**
 * Form data for token locking, extends AssetInputFormData.
 */
export interface IGaugeVoterLockFormData extends IAssetInputFormData {}

export const GaugeVoterLockForm: React.FC<IGaugeVoterLockFormProps> = (
    props,
) => {
    const { plugin, daoId, mode = 'panel', onCancel } = props;

    const { votingEscrow, token } = plugin.settings;
    const { votingEscrow: votingEscrowAddresses } = plugin;

    invariant(
        votingEscrow != null && votingEscrowAddresses != null,
        'GaugeVoterLockForm: escrow settings are required',
    );

    const { escrowAddress } = votingEscrowAddresses;
    const { decimals } = token;

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useConnection();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { openIfNeeded } = useOpenDelegationOnboardingIfNeeded({
        tokenAddress: token.address,
        tokenSymbol: token.symbol,
        network: dao!.network,
        daoId,
    });

    const memberLocksQueryParams = {
        network: dao!.network,
        escrowAddress,
        onlyActive: true,
    };
    const { data: memberLocks, refetch: refetchMemberLocks } = useMemberLocks(
        {
            urlParams: { address: address! },
            queryParams: memberLocksQueryParams,
        },
        { enabled: address != null },
    );
    const locksCount = memberLocks?.pages[0]?.metadata.totalRecords ?? 0;

    const isMounted = useIsMounted();
    const { result: isConnected, check: walletGuard } =
        useConnectedWalletGuard();
    const effectiveIsConnected = isMounted && isConnected;

    const {
        allowance,
        balance: unlockedBalance,
        status: unlockedBalanceStatus,
        invalidateQueries,
    } = useTokenCheckTokenAllowance({
        spender: escrowAddress,
        token: { ...token, address: token.underlying! },
    });

    const parsedUnlockedAmount = formatUnits(
        unlockedBalance?.value ?? BigInt(0),
        decimals,
    );
    const userAsset = useMemo(
        () => ({ token, amount: parsedUnlockedAmount }),
        [token, parsedUnlockedAmount],
    );

    const formValues = useForm<IGaugeVoterLockFormData>({
        mode: 'onSubmit',
        defaultValues: { asset: userAsset },
    });
    const { control, setValue, handleSubmit } = formValues;

    const lockAmount = useWatch<IGaugeVoterLockFormData, 'amount'>({
        control,
        name: 'amount',
    });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);

    const needsApproval =
        effectiveIsConnected &&
        (allowance == null || allowance < lockAmountWei);

    const handleFormSubmit = () => {
        if (needsApproval) {
            handleApproveTokens();
        } else {
            handleLockTokens(lockAmountWei);
        }
    };

    const handleApproveTokens = () => {
        const { symbol } = token;
        const transactionInfoTitle = t(
            'app.plugins.gaugeVoter.gaugeVoterLockForm.approveTransactionInfoTitle',
            { symbol },
        );
        const transactionInfo = {
            title: transactionInfoTitle,
            current: 1,
            total: 2,
        };

        const params: ITokenApproveTokensDialogParams = {
            token: { ...token, address: token.underlying! },
            amount: lockAmountWei,
            network: dao!.network,
            translationNamespace: 'LOCK',
            onSuccess: () => onApproveTokensSuccess(lockAmountWei),
            spender: escrowAddress,
            transactionInfo,
        };

        open(TokenPluginDialogId.APPROVE_TOKENS, { params });
    };

    const handleLockTokens = (amount: bigint) => {
        const params: IGaugeVoterLockUnlockDialogParams = {
            action: 'lock',
            dao: dao!,
            amount,
            escrowContract: escrowAddress,
            token,
            onSuccess: () => {
                invalidateQueries();
                if (token.hasDelegate) {
                    openIfNeeded();
                }
            },
            onSuccessClick: onLockTokensSuccessClick,
            showTransactionInfo: needsApproval,
        };
        open(GaugeVoterPluginDialogId.LOCK_UNLOCK, { params });
    };

    const onApproveTokensSuccess = (amount: bigint) => {
        invalidateQueries();
        handleLockTokens(amount);
    };

    const onLockTokensSuccessClick = () => {
        void refetchMemberLocks();
        handleViewLocks();
    };

    const handleViewLocks = () => {
        const params: IGaugeVoterLocksDialogParams = {
            dao: dao!,
            plugin,
        };
        open(GaugeVoterPluginDialogId.VIEW_LOCKS, { params });
    };

    // Initialize asset field after fetching unlocked balance
    useEffect(() => {
        if (unlockedBalanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, unlockedBalanceStatus, userAsset]);

    const minDepositWei = BigInt(votingEscrow.minDeposit);
    const formattedMinDeposit = formatUnits(minDepositWei, decimals);

    const submitLabel = needsApproval ? 'approve' : 'lock';
    const disableSubmit = unlockedBalance?.value === BigInt(0);

    const renderSubmitButton = ({ size }: { size: 'md' | 'lg' }) => (
        <Button
            disabled={disableSubmit}
            iconRight={mode === 'dialog' ? IconType.CHEVRON_RIGHT : undefined}
            onClick={effectiveIsConnected ? undefined : () => walletGuard()}
            size={size}
            type={effectiveIsConnected ? 'submit' : undefined}
        >
            {t(
                `app.plugins.gaugeVoter.gaugeVoterLockForm.submit.${submitLabel}`,
                {
                    symbol: token.symbol,
                },
            )}
        </Button>
    );

    const footerInfo = (
        <FooterInfo
            mode={mode}
            text={t('app.plugins.gaugeVoter.gaugeVoterLockForm.footerInfo')}
        />
    );

    return (
        <FormProvider {...formValues}>
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(handleFormSubmit)}
            >
                <div className="flex flex-col gap-3">
                    <GaugeVoterLockFormChart
                        amount={lockAmount}
                        settings={plugin.settings}
                    />
                    <AssetInput
                        disableAssetField={true}
                        hideAmountLabel={true}
                        hideMax={true}
                        minAmount={Number.parseFloat(formattedMinDeposit)}
                        percentageSelection={{
                            totalBalance: unlockedBalance?.value,
                            tokenDecimals: decimals,
                        }}
                    />
                </div>
                {mode === 'dialog' ? (
                    <div className="flex flex-col gap-9">
                        {footerInfo}
                        <div className="flex justify-between gap-3">
                            {onCancel != null && (
                                <Button
                                    onClick={onCancel}
                                    size="md"
                                    variant="tertiary"
                                >
                                    {t(
                                        'app.plugins.gaugeVoter.gaugeVoterLockForm.cancel',
                                    )}
                                </Button>
                            )}
                            {renderSubmitButton({ size: 'md' })}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {renderSubmitButton({ size: 'lg' })}
                        {locksCount > 0 && (
                            <Button
                                onClick={handleViewLocks}
                                size="lg"
                                variant="secondary"
                            >
                                {t(
                                    'app.plugins.gaugeVoter.gaugeVoterLockForm.locks',
                                    {
                                        count: locksCount,
                                    },
                                )}
                            </Button>
                        )}
                        {footerInfo}
                    </div>
                )}
            </form>
        </FormProvider>
    );
};
