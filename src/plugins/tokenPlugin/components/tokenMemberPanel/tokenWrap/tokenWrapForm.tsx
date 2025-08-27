import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IToken } from '@/modules/finance/api/financeService';
import { AssetInput, type IAssetInputFormData } from '@/modules/finance/components/assetInput';
import { useMember } from '@/modules/governance/api/governanceService';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenWrapUnwrapDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenWrapUnwrapDialog';
import type { ITokenMember, ITokenPluginSettings } from '@/plugins/tokenPlugin/types';
import { useDao, type IDaoPlugin } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { Button, formatterUtils, NumberFormat } from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { useCheckTokenAllowance } from '../hooks/useCheckTokenAllowance';

export interface ITokenWrapFormProps {
    /**
     * DAO plugin for the token delegation.
     */
    plugin: IDaoPlugin<ITokenPluginSettings>;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Underlying token of the wrapper governance token.
     */
    underlyingToken: IToken;
}

export interface ITokenWrapFormData extends IAssetInputFormData {}

export const TokenWrapForm: React.FC<ITokenWrapFormProps> = (props) => {
    const { plugin, daoId, underlyingToken } = props;

    const { token } = plugin.settings;
    const { symbol, decimals } = token;

    const { open } = useDialogContext();
    const { t } = useTranslations();

    const { address } = useAccount();
    const { data: dao } = useDao({ urlParams: { id: daoId } });

    const { result: isConnected, check: walletGuard } = useConnectedWalletGuard();

    const { data: tokenMember, refetch: refetchMember } = useMember<ITokenMember>(
        { urlParams: { address: address as string }, queryParams: { daoId, pluginAddress: plugin.address } },
        { enabled: address != null },
    );

    const {
        allowance,
        balance: unwrappedBalance,
        status: unwrappedBalanceStatus,
        invalidateQueries,
    } = useCheckTokenAllowance({ spender: token.address, token: underlyingToken });

    const parsedUnwrappedAmount = formatUnits(unwrappedBalance?.value ?? BigInt(0), decimals);
    const userAsset = useMemo(
        () => ({ token: underlyingToken, amount: parsedUnwrappedAmount }),
        [underlyingToken, parsedUnwrappedAmount],
    );

    const formValues = useForm<ITokenWrapFormData>({ mode: 'onSubmit', defaultValues: { asset: userAsset } });
    const { control, setValue, handleSubmit } = formValues;

    const wrapAmount = useWatch<ITokenWrapFormData, 'amount'>({ control, name: 'amount' });
    const wrapAmountWei = parseUnits(wrapAmount ?? '0', token.decimals);

    const needsApproval = isConnected && (allowance == null || allowance < wrapAmountWei);

    const handleFormSubmit = () => {
        if (needsApproval) {
            handleApproveTokens();
        } else {
            handleWrapUnwrapTokens('wrap', wrapAmountWei);
        }
    };

    const handleApproveTokens = () => {
        const { symbol } = underlyingToken;
        const txInfoTitle = t('app.plugins.token.tokenWrapForm.approveTransactionInfoTitle', { symbol });
        const transactionInfo = { title: txInfoTitle, current: 1, total: 2 };

        const params: ITokenApproveTokensDialogParams = {
            token: underlyingToken,
            amount: wrapAmountWei,
            network: dao!.network,
            translationNamespace: 'WRAP',
            onSuccess: () => onApproveTokensSuccess(wrapAmountWei),
            spender: token.address,
            transactionInfo,
        };

        open(TokenPluginDialogId.APPROVE_TOKENS, { params });
    };

    const handleWrapUnwrapTokens = (action: 'wrap' | 'unwrap', amount: bigint) => {
        const params: ITokenWrapUnwrapDialogParams = {
            action,
            token,
            underlyingToken,
            amount,
            network: dao!.network,
            onSuccess: onWrapUnwrapTokensSuccess,
            showTransactionInfo: action === 'wrap' && needsApproval,
        };

        open(TokenPluginDialogId.WRAP_UNWRAP, { params });
    };

    const onApproveTokensSuccess = (tokenAmount: bigint) => {
        invalidateQueries();
        handleWrapUnwrapTokens('wrap', tokenAmount);
    };

    const onWrapUnwrapTokensSuccess = () => {
        invalidateQueries();
        void refetchMember();
    };

    // Initialize asset field after fetching unwrapped balance
    useEffect(() => {
        if (unwrappedBalanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, unwrappedBalanceStatus, userAsset]);

    const wrappedAmount = BigInt(tokenMember?.tokenBalance ?? '0');
    const parsedWrappedAmount = formatUnits(wrappedAmount, decimals);

    const formattedWrappedAmount = formatterUtils.formatNumber(parsedWrappedAmount, {
        format: NumberFormat.TOKEN_AMOUNT_SHORT,
    });

    const submitLabel = needsApproval ? 'approve' : 'wrap';
    const disableSubmit = unwrappedBalance?.value === BigInt(0);

    return (
        <FormProvider {...formValues}>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
                <p className="text-base leading-normal font-normal text-neutral-500">
                    {t('app.plugins.token.tokenWrapForm.info', { underlyingSymbol: underlyingToken.symbol })}
                </p>
                <div className="flex flex-col gap-3">
                    <AssetInput
                        disableAssetField={true}
                        hideMax={true}
                        hideAmountLabel={true}
                        percentageSelection={{
                            totalBalance: unwrappedBalance?.value,
                            tokenDecimals: decimals,
                        }}
                    />
                </div>
                <div className="flex flex-col gap-3">
                    <Button
                        type={isConnected ? 'submit' : undefined}
                        onClick={isConnected ? undefined : () => walletGuard()}
                        disabled={disableSubmit}
                        variant="primary"
                        size="lg"
                    >
                        {t(`app.plugins.token.tokenWrapForm.submit.${submitLabel}`, {
                            underlyingSymbol: underlyingToken.symbol,
                        })}
                    </Button>
                    {wrappedAmount > 0 && (
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => handleWrapUnwrapTokens('unwrap', wrappedAmount)}
                        >
                            {t('app.plugins.token.tokenWrapForm.submit.unwrap', {
                                amount: formattedWrappedAmount,
                                symbol,
                            })}
                        </Button>
                    )}
                    <p className="text-center text-sm leading-normal font-normal text-neutral-500">
                        {t('app.plugins.token.tokenWrapForm.footerInfo')}
                    </p>
                </div>
            </form>
        </FormProvider>
    );
};
