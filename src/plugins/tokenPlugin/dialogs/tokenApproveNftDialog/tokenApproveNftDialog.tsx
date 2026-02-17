'use client';

import { AssetDataListItem, invariant } from '@aragon/gov-ui-kit';
import type { Hex } from 'viem';
import { useConnection } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import type { ITransactionInfo } from '@/shared/components/transactionStatus';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
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

export interface ITokenApproveNftDialogProps
    extends IDialogComponentProps<ITokenApproveNftDialogParams> {}

export const TokenApproveNftDialog: React.FC<ITokenApproveNftDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'TokenApproveNftDialog: required parameters must be set.',
    );

    const { address } = useConnection();
    invariant(
        address != null,
        'TokenApproveNftDialog: user must be connected.',
    );

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
    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({ initialActiveStep });

    const handlePrepareTransaction = () =>
        tokenApproveNftDialogUtils.buildApproveTransaction({
            tokenAddress,
            tokenId,
            spender,
        });

    return (
        <TransactionDialog
            description={t(
                `app.plugins.token.tokenApproveNftDialog.${translationNamespace}.description`,
            )}
            network={network}
            onCancelClick={onClose}
            onSuccess={onSuccess}
            prepareTransaction={handlePrepareTransaction}
            stepper={stepper}
            submitLabel={t(
                `app.plugins.token.tokenApproveNftDialog.${translationNamespace}.submit`,
            )}
            title={t(
                `app.plugins.token.tokenApproveNftDialog.${translationNamespace}.title`,
            )}
            transactionInfo={transactionInfo}
        >
            <AssetDataListItem.Structure
                amount={1}
                hideValue={true}
                name={
                    tokenName ??
                    t(
                        `app.plugins.token.tokenApproveNftDialog.${translationNamespace}.nftName`,
                    )
                }
                symbol={`#${tokenId.toString()}`}
            />
        </TransactionDialog>
    );
};
