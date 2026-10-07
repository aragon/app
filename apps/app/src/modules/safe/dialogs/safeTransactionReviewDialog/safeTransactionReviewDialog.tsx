'use client';

import { Dialog, invariant } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import type { ISafeMultisigTransaction } from '@/shared/api/safeService';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { SafeTransactionReviewContent } from '../../components/safeTransactionReviewContent';

export interface ISafeTransactionReviewDialogParams {
    /**
     * Transaction to review, as reported by the Safe transaction service.
     */
    transaction: ISafeMultisigTransaction;
    /**
     * Address of the Safe the transaction belongs to.
     */
    safeAddress: string;
    /**
     * Network the Safe is deployed on.
     */
    network: Network;
    /**
     * Contract version of the Safe as reported by the transaction service. Compared against the
     * version read from the Safe onchain rather than trusted as an authoritative hash input; null
     * while unknown, which makes the hash unverifiable rather than wrong.
     */
    safeVersion: string | null;
}

export interface ISafeTransactionReviewDialogProps
    extends IDialogComponentProps<ISafeTransactionReviewDialogParams> {}

export const SafeTransactionReviewDialog: React.FC<
    ISafeTransactionReviewDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'SafeTransactionReviewDialog: required parameters must be set.',
    );

    const { transaction, safeAddress, network, safeVersion } = location.params;
    const { t } = useTranslations();
    const { close } = useDialogContext();

    return (
        <>
            <Dialog.Header
                onClose={() => close(location.id)}
                title={t('app.safe.safeTransactionReviewDialog.title')}
            />
            <Dialog.Content className="pb-4 md:pb-6">
                <SafeTransactionReviewContent
                    network={network}
                    safeAddress={safeAddress}
                    safeVersion={safeVersion}
                    transaction={transaction}
                />
            </Dialog.Content>
        </>
    );
};
