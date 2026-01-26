import { Button, invariant } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import {
    AssetInput,
    type IAssetInputFormData,
} from '@/modules/finance/components/assetInput';
import { useMemberLocks } from '@/plugins/tokenPlugin/api/tokenService';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenLocksDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenLocksDialog';
import type { ITokenLockUnlockDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenLockUnlockDialog';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useCheckTokenAllowance } from '../../../tokenPlugin/components/tokenMemberPanel/hooks/useCheckTokenAllowance';
import type { ITokenPlugin } from '../../../tokenPlugin/types';
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
}

/**
 * Form data for token locking, extends AssetInputFormData.
 */
export interface IGaugeVoterLockFormData extends IAssetInputFormData {}

export const GaugeVoterLockForm: React.FC<IGaugeVoterLockFormProps> = (
    props,
) => {
    const { plugin, daoId } = props;

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
    const { address } = useAccount();

    const { data: dao } = useDao({ urlParams: { id: daoId } });

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

    const { result: isConnected, check: walletGuard } =
        useConnectedWalletGuard();

    const {
        allowance,
        balance: unlockedBalance,
        status: unlockedBalanceStatus,
        invalidateQueries,
    } = useCheckTokenAllowance({
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
        isConnected && (allowance == null || allowance < lockAmountWei);

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
            'app.plugins.token.tokenLockForm.approveTransactionInfoTitle',
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
        const params: ITokenLockUnlockDialogParams = {
            action: 'lock',
            dao: dao!,
            amount,
            escrowContract: escrowAddress,
            token,
            onSuccess: invalidateQueries,
            onSuccessClick: onLockTokensSuccessClick,
            showTransactionInfo: needsApproval,
        };
        open(TokenPluginDialogId.LOCK_UNLOCK, { params });
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
        const params: ITokenLocksDialogParams = {
            dao: dao!,
            plugin: plugin as unknown as ITokenPlugin,
        };
        open(TokenPluginDialogId.VIEW_LOCKS, { params });
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
                <div className="flex flex-col gap-3">
                    <Button
                        disabled={disableSubmit}
                        onClick={isConnected ? undefined : () => walletGuard()}
                        size="lg"
                        type={isConnected ? 'submit' : undefined}
                        variant="primary"
                    >
                        {t(
                            `app.plugins.token.tokenLockForm.submit.${submitLabel}`,
                            {
                                symbol: token.symbol,
                            },
                        )}
                    </Button>
                    {locksCount > 0 && (
                        <Button
                            onClick={handleViewLocks}
                            size="lg"
                            variant="secondary"
                        >
                            {t('app.plugins.token.tokenLockForm.locks', {
                                count: locksCount,
                            })}
                        </Button>
                    )}
                    <p className="text-center font-normal text-neutral-500 text-sm leading-normal">
                        {t('app.plugins.token.tokenLockForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
