'use client';

import { AssetDataListItem, invariant } from '@aragon/gov-ui-kit';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import type { IToken } from '@/modules/finance/api/financeService';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import { type ITransactionDialogStepMeta, TransactionDialog, TransactionDialogStep } from '@/shared/components/transactionDialog';
import type { ITransactionInfo } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { tokenApproveTokensDialogUtils } from './tokenApproveTokensDialogUtils';

export interface ITokenApproveTokensDialogParams {
    /**
     * Token to be approved.
     */
    token: IToken;
    /**
     * Amount of tokens to be approved in WEI format.
     */
    amount: bigint;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called on approve transaction success.
     */
    onSuccess: () => void;
    /**
     * First argument of the approve function, which is the address of the spender.
     */
    spender: string;
    /**
     * Translation namespace for the dialog.
     */
    translationNamespace: 'WRAP' | 'LOCK';
    /**
     * Transaction info for the dialog.
     */
    transactionInfo: ITransactionInfo;
}

export interface ITokenApproveTokensDialogProps extends IDialogComponentProps<ITokenApproveTokensDialogParams> {}

export const TokenApproveTokensDialog: React.FC<ITokenApproveTokensDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenApproveTokensDialog: required parameters must be set.');
    const { token, amount, network, onSuccess, spender, translationNamespace, transactionInfo } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'TokenApproveTokensDialog: user must be connected.');

    const { t } = useTranslations();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () =>
        tokenApproveTokensDialogUtils.buildApproveTransaction({
            token: token.address,
            amount,
            spender,
        });

    const parsedAmount = formatUnits(amount, token.decimals);

    return (
        <TransactionDialog
            description={t(`app.plugins.token.tokenApproveTokensDialog.${translationNamespace}.description`)}
            network={network}
            onSuccess={onSuccess}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(`app.plugins.token.tokenApproveTokensDialog.${translationNamespace}.submit`)}
            title={t(`app.plugins.token.tokenApproveTokensDialog.${translationNamespace}.title`)}
            transactionInfo={transactionInfo}
        >
            <AssetDataListItem.Structure
                amount={parsedAmount}
                hideValue={true}
                logoSrc={token.logo}
                name={token.name}
                symbol={token.symbol}
            />
        </TransactionDialog>
    );
};
