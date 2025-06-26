'use client';

import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    TransactionDialog,
    TransactionDialogStep,
    type ITransactionDialogStepMeta,
} from '@/shared/components/transactionDialog';
import type { ITransactionInfo } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { AssetDataListItem, invariant } from '@aragon/gov-ui-kit';
import { type Hex } from 'viem';
import { useAccount } from 'wagmi';
import { tokenApproveNftDialogUtils } from './tokenApproveNftDialogUtils';

export interface ITokenApproveNftDialogParams {
    /**
     * The NFT token contract address.
     */
    tokenAddress: Hex;
    /**
     * The ID of the token to approve.
     */
    tokenId: bigint;
    /**
     * The token name.
     */
    tokenName?: string;
    /**
     * Network used for the transaction.
     */
    network: Network;
    /**
     * Callback called on approve transaction success.
     */
    onSuccess: () => void;
    /**
     * Callback called on cancel button click.
     */
    onClose?: () => void;
    /**
     * First argument of the approve function, which is the address of the spender.
     */
    spender: Hex;
    /**
     * Translation namespace for the dialog.
     */
    translationNamespace: 'UNLOCK';
    /**
     * Transaction info for the dialog.
     */
    transactionInfo: ITransactionInfo;
}

export interface ITokenApproveNftDialogProps extends IDialogComponentProps<ITokenApproveNftDialogParams> {}

export const TokenApproveNftDialog: React.FC<ITokenApproveNftDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenApproveNftDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenApproveNftDialog: user must be connected.');

    const {
        tokenAddress,
        tokenId,
        tokenName,
        network,
        onSuccess,
        onClose,
        spender,
        translationNamespace,
        transactionInfo,
    } = location.params;

    const { t } = useTranslations();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () =>
        tokenApproveNftDialogUtils.buildApproveTransaction({ tokenAddress, tokenId, spender });

    return (
        <TransactionDialog
            title={t(`app.plugins.token.tokenApproveNftDialog.${translationNamespace}.title`)}
            description={t(`app.plugins.token.tokenApproveNftDialog.${translationNamespace}.description`)}
            submitLabel={t(`app.plugins.token.tokenApproveNftDialog.${translationNamespace}.submit`)}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            onSuccess={onSuccess}
            onCancelClick={onClose}
            transactionInfo={transactionInfo}
        >
            <AssetDataListItem.Structure
                name={tokenName ?? t(`app.plugins.token.tokenApproveNftDialog.${translationNamespace}.nftName`)}
                amount={1}
                symbol={`#${tokenId.toString()}`}
                hideValue={true}
            />
        </TransactionDialog>
    );
};
