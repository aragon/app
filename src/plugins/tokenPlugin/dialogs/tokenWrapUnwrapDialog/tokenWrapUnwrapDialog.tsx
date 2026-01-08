'use client';

import { AssetDataListItem, invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import type { ITokenPluginSettingsToken } from '../../types';
import { tokenWrapUnwrapDialogUtils } from './tokenWrapUnwrapDialogUtils';

export interface ITokenWrapUnwrapDialogParams {
    /**
     * Action to be performed.
     */
    action: 'wrap' | 'unwrap';
    /**
     * Wrapper governance token.
     */
    token: ITokenPluginSettingsToken;
    /**
     * Underlying token of the wrapper governance token.
     */
    underlyingToken: IToken;
    /**
     * Amount of tokens to be wrapped / unwrapped in WEI format.
     */
    amount: bigint;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called on wrap / unwrap transaction success.
     */
    onSuccess?: () => void;
    /**
     * Flag indicating whether to show the transaction info step in the dialog. Only shown when part of a two step transaction.
     */
    showTransactionInfo: boolean;
}

export interface ITokenWrapUnwrapDialogProps
    extends IDialogComponentProps<ITokenWrapUnwrapDialogParams> {}

export const TokenWrapUnwrapDialog: React.FC<ITokenWrapUnwrapDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'TokenWrapUnwrapDialog: required parameters must be set.',
    );

    const { address } = useAccount();
    invariant(
        address != null,
        'TokenWrapUnwrapDialog: user must be connected to perform the action',
    );

    const {
        action,
        token,
        underlyingToken,
        amount,
        network,
        onSuccess,
        showTransactionInfo,
    } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep });

    const handlePrepareTransaction = () =>
        action === 'wrap'
            ? tokenWrapUnwrapDialogUtils.buildWrapTransaction({
                  token,
                  address,
                  amount,
              })
            : tokenWrapUnwrapDialogUtils.buildUnwrapTransaction({
                  token,
                  address,
                  amount,
              });

    const parsedAmount = formatUnits(amount, token.decimals);
    const assetToken = action === 'wrap' ? underlyingToken : token;

    const transactionInfo = {
        title: t(
            `app.plugins.token.tokenWrapUnwrapDialog.${action}.transactionInfoTitle`,
            {
                symbol: assetToken.symbol,
            },
        ),
        current: 2,
        total: 2,
    };

    return (
        <TransactionDialog
            description={t(
                `app.plugins.token.tokenWrapUnwrapDialog.${action}.description`,
            )}
            network={network}
            onSuccess={onSuccess}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(
                `app.plugins.token.tokenWrapUnwrapDialog.${action}.submit`,
            )}
            successLink={{
                label: t(
                    `app.plugins.token.tokenWrapUnwrapDialog.${action}.success`,
                ),
                onClick: () => router.refresh(),
            }}
            title={t(`app.plugins.token.tokenWrapUnwrapDialog.${action}.title`)}
            transactionInfo={showTransactionInfo ? transactionInfo : undefined}
        >
            <AssetDataListItem.Structure
                amount={parsedAmount}
                hideValue={true}
                logoSrc={assetToken.logo}
                name={assetToken.name}
                symbol={assetToken.symbol}
            />
        </TransactionDialog>
    );
};
