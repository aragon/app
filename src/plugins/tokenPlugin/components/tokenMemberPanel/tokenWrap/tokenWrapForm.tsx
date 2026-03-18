import {
    Button,
    formatterUtils,
    IconType,
    NumberFormat,
} from '@aragon/gov-ui-kit';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { formatUnits, parseUnits } from 'viem';
import { useConnection } from 'wagmi';
import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import type { IToken } from '@/modules/finance/api/financeService';
import {
    AssetInput,
    type IAssetInputFormData,
} from '@/modules/finance/components/assetInput';
import { TokenPluginDialogId } from '@/plugins/tokenPlugin/constants/tokenPluginDialogId';
import type { ITokenApproveTokensDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenApproveTokensDialog';
import type { ITokenWrapUnwrapDialogParams } from '@/plugins/tokenPlugin/dialogs/tokenWrapUnwrapDialog';
import { useOpenDelegationOnboardingIfNeeded } from '@/plugins/tokenPlugin/hooks/useOpenDelegationOnboardingIfNeeded';
import { useTokenCheckTokenAllowance } from '@/plugins/tokenPlugin/hooks/useTokenCheckTokenAllowance';
import { useWrappedTokenBalance } from '@/plugins/tokenPlugin/hooks/useWrappedTokenBalance';
import type { ITokenPluginSettingsToken } from '@/plugins/tokenPlugin/types';
import { useDao } from '@/shared/api/daoService';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { FooterInfo } from '@/shared/components/footerInfo';
import { useTranslations } from '@/shared/components/translationsProvider';

export interface ITokenWrapFormProps {
    /**
     * Token used by the plugin.
     */
    token: ITokenPluginSettingsToken;
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Underlying token of the wrapper governance token.
     */
    underlyingToken: IToken;
    /**
     * Rendering mode: 'panel' (default) or 'dialog'.
     */
    mode?: 'panel' | 'dialog';
    /**
     * Callback invoked when the user cancels (dialog mode only).
     */
    onCancel?: () => void;
}

export interface ITokenWrapFormData extends IAssetInputFormData {}

export const TokenWrapForm: React.FC<ITokenWrapFormProps> = (props) => {
    const { token, daoId, underlyingToken, mode = 'panel', onCancel } = props;
    const { symbol, decimals } = token;

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

    const { result: isConnected, check: walletGuard } =
        useConnectedWalletGuard();

    const {
        allowance,
        balance: unwrappedBalance,
        status: unwrappedBalanceStatus,
        invalidateQueries,
    } = useTokenCheckTokenAllowance({
        spender: token.address,
        token: underlyingToken,
    });

    // Read wrapped token balance directly from blockchain
    const { balance: wrappedBalance, refetch: refetchWrappedBalance } =
        useWrappedTokenBalance({
            userAddress: address,
            token,
        });

    const parsedUnwrappedAmount = formatUnits(
        unwrappedBalance?.value ?? BigInt(0),
        decimals,
    );
    const userAsset = useMemo(
        () => ({ token: underlyingToken, amount: parsedUnwrappedAmount }),
        [underlyingToken, parsedUnwrappedAmount],
    );

    const formValues = useForm<ITokenWrapFormData>({
        mode: 'onSubmit',
        defaultValues: { asset: userAsset },
    });
    const { control, setValue, handleSubmit } = formValues;

    const wrapAmount = useWatch<ITokenWrapFormData, 'amount'>({
        control,
        name: 'amount',
    });
    const wrapAmountWei = parseUnits(wrapAmount ?? '0', token.decimals);

    const needsApproval =
        isConnected && (allowance == null || allowance < wrapAmountWei);

    const handleFormSubmit = () => {
        if (needsApproval) {
            handleApproveTokens();
        } else {
            handleWrapUnwrapTokens('wrap', wrapAmountWei);
        }
    };

    const handleApproveTokens = () => {
        const { symbol } = underlyingToken;
        const txInfoTitle = t(
            'app.plugins.token.tokenWrapForm.approveTransactionInfoTitle',
            { symbol },
        );
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

    const handleWrapUnwrapTokens = (
        action: 'wrap' | 'unwrap',
        amount: bigint,
    ) => {
        const params: ITokenWrapUnwrapDialogParams = {
            action,
            token,
            underlyingToken,
            amount,
            network: dao!.network,
            onSuccess: () => onWrapUnwrapTokensSuccess(action),
            showTransactionInfo: action === 'wrap' && needsApproval,
        };

        open(TokenPluginDialogId.WRAP_UNWRAP, { params });
    };

    const onApproveTokensSuccess = (tokenAmount: bigint) => {
        invalidateQueries();
        void refetchWrappedBalance();
        handleWrapUnwrapTokens('wrap', tokenAmount);
    };

    const onWrapUnwrapTokensSuccess = (action: 'wrap' | 'unwrap') => {
        invalidateQueries();
        void refetchWrappedBalance();
        if (action === 'wrap') {
            openIfNeeded();
        }
    };

    // Initialize asset field after fetching unwrapped balance
    useEffect(() => {
        if (unwrappedBalanceStatus === 'success') {
            setValue('asset', userAsset);
        }
    }, [setValue, unwrappedBalanceStatus, userAsset]);

    // Read wrapped token balance directly from blockchain
    const parsedWrappedAmount = formatUnits(wrappedBalance, decimals);

    const formattedWrappedAmount = formatterUtils.formatNumber(
        parsedWrappedAmount,
        {
            format: NumberFormat.TOKEN_AMOUNT_SHORT,
        },
    );

    const submitLabel = needsApproval ? 'approve' : 'wrap';
    const disableSubmit = unwrappedBalance?.value === BigInt(0);

    const renderSubmitButton = ({ size }: { size: 'md' | 'lg' }) => (
        <Button
            disabled={disableSubmit}
            iconRight={mode === 'dialog' ? IconType.CHEVRON_RIGHT : undefined}
            onClick={isConnected ? undefined : () => walletGuard()}
            size={size}
            type={isConnected ? 'submit' : undefined}
            variant="primary"
        >
            {t(`app.plugins.token.tokenWrapForm.submit.${submitLabel}`, {
                underlyingSymbol: underlyingToken.symbol,
            })}
        </Button>
    );

    const footerInfo = (
        <FooterInfo
            mode={mode}
            text={t('app.plugins.token.tokenWrapForm.footerInfo')}
        />
    );

    return (
        <FormProvider {...formValues}>
            <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit(handleFormSubmit)}
            >
                <p className="font-normal text-base text-neutral-500 leading-normal">
                    {t('app.plugins.token.tokenWrapForm.info', {
                        underlyingSymbol: underlyingToken.symbol,
                    })}
                </p>
                <div className="flex flex-col gap-3">
                    <AssetInput
                        disableAssetField={true}
                        hideAmountLabel={true}
                        hideMax={true}
                        percentageSelection={{
                            totalBalance: unwrappedBalance?.value,
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
                                        'app.plugins.token.tokenWrapForm.cancel',
                                    )}
                                </Button>
                            )}
                            {renderSubmitButton({ size: 'md' })}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {renderSubmitButton({ size: 'lg' })}
                        {wrappedBalance > 0 && (
                            <Button
                                onClick={() =>
                                    handleWrapUnwrapTokens(
                                        'unwrap',
                                        wrappedBalance,
                                    )
                                }
                                size="lg"
                                variant="secondary"
                            >
                                {t(
                                    'app.plugins.token.tokenWrapForm.submit.unwrap',
                                    {
                                        amount: formattedWrappedAmount,
                                        symbol,
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
