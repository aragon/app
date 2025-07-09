import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useMemberLocks } from '@/plugins/tokenPlugin/api/tokenService';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenLockUnlockDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenLockUnlockDialog';
import type { ITokenPlugin } from '@/plugins/tokenPlugin/types';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, invariant, Toggle, ToggleGroup } from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { ITokenLocksDialogParams } from '../../../../dialogs/tokenLocksDialog';
import { useCheckTokenAllowance } from '../../hooks/useCheckTokenAllowance';
import { TokenLockFormChart } from './tokenLockFormChart';

export interface ITokenLockFormProps {
    /**
     * DAO plugin for the token locking.
     */
    plugin: ITokenPlugin;
    /**
     * ID of the DAO.
     */
    daoId: string;
}

export interface ITokenLockFormData extends IAssetInputFormData {}

const valuePercentages = ['0', '25', '50', '75', '100'];

export const TokenLockForm: React.FC<ITokenLockFormProps> = (props) => {
    const { plugin, daoId } = props;

    const { votingEscrow, token } = plugin.settings;
    const { votingEscrow: votingEscrowAddresses } = plugin;

    invariant(votingEscrow != null && votingEscrowAddresses != null, 'TokenLockForm: escrow settings are required');

    const { escrowAddress } = votingEscrowAddresses;
    const { decimals } = token;

    const { open } = useDialogContext();
    const { t } = useTranslations();
    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const memberLocksQueryParams = { network: dao!.network, escrowAddress, onlyActive: true };
    const { data: memberLocks, refetch: refetchLocks } = useMemberLocks(
        { urlParams: { address: address! }, queryParams: memberLocksQueryParams },
        { enabled: address != null },
    );
    const locksCount = memberLocks?.pages[0].metadata.totalRecords ?? 0;

    const [percentageValue, setPercentageValue] = useState<string>('100');

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const {
        allowance,
        balance: unlockedBalance,
        status: unlockedBalanceStatus,
        invalidateQueries,
    } = useCheckTokenAllowance({ spender: escrowAddress, token: { ...token, address: token.underlying! } });

    const parsedUnlockedAmount = formatUnits(unlockedBalance?.value ?? BigInt(0), decimals);
    const userAsset = useMemo(() => ({ token, amount: parsedUnlockedAmount }), [token, parsedUnlockedAmount]);

    const formValues = useForm<ITokenLockFormData>({ mode: 'onSubmit', defaultValues: { asset: userAsset } });
    const { control, setValue, handleSubmit } = formValues;

    const lockAmount = useWatch<ITokenLockFormData, 'amount'>({ control, name: 'amount' });
    const lockAmountWei = parseUnits(lockAmount ?? '0', token.decimals);

    const needsApproval = isConnected && (allowance == null || allowance < lockAmountWei);

    const handleFormSubmit = () => {
        if (needsApproval) {
            handleApproveTokens();
        } else {
            handleLockTokens(lockAmountWei);
        }
    };

    const handleApproveTokens = () => {
        const { symbol } = token;
        const transactionInfoTitle = t('app.plugins.token.tokenLockForm.approveTransactionInfoTitle', { symbol });
        const transactionInfo = { title: transactionInfoTitle, current: 1, total: 2 };

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
        void refetchLocks();
        handleViewLocks();
    };

    const handleViewLocks = () => {
        const params: ITokenLocksDialogParams = { dao: dao!, plugin };
        open(TokenPluginDialogId.VIEW_LOCKS, { params });
    };

    const updateAmountField = useCallback(
        (value?: string) => {
            if (unlockedBalance == null || value == null) {
                return;
            }

            const processedValue = (unlockedBalance.value * BigInt(value)) / BigInt(100);
            const parsedValue = formatUnits(processedValue, decimals);
            setValue('amount', parsedValue);
        },
        [unlockedBalance, decimals, setValue],
    );

    const handlePercentageChange = useCallback(
        (value = '') => {
            updateAmountField(value);
            setPercentageValue(value);
        },
        [updateAmountField],
    );

    // Update amount field and percentage value to 100% of user unlocked balance on user balance change
    useEffect(() => handlePercentageChange('100'), [handlePercentageChange]);

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
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="flex flex-col gap-3">
                    <TokenLockFormChart amount={lockAmount} settings={plugin.settings} />
                    <AssetInput
                        onAmountChange={() => setPercentageValue('')}
                        disableAssetField={true}
                        hideMax={true}
                        hideAmountLabel={true}
                        minAmount={parseFloat(formattedMinDeposit)}
                    />
                    <ToggleGroup
                        isMultiSelect={false}
                        value={percentageValue}
                        onChange={handlePercentageChange}
                        variant="space-between"
                    >
                        {valuePercentages.map((value) => (
                            <Toggle
                                key={value}
                                value={value}
                                label={t(`app.plugins.token.tokenLockForm.percentage.${value}`)}
                            />
                        ))}
                    </ToggleGroup>
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        type={isConnected ? 'submit' : undefined}
                        onClick={isConnected ? undefined : () => walletGuard()}
                        disabled={disableSubmit}
                        variant="primary"
                        size="lg"
                    >
                        {t(`app.plugins.token.tokenLockForm.submit.${submitLabel}`, {
                            symbol: token.symbol,
                        })}
                    </Button>
                    {locksCount > 0 && (
                        <Button variant="secondary" size="lg" onClick={handleViewLocks}>
                            {t('app.plugins.token.tokenLockForm.locks', { count: locksCount })}
                        </Button>
                    )}
                    <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                        {t('app.plugins.token.tokenLockForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
