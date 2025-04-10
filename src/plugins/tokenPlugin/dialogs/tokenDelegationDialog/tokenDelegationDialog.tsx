import type { Network } from '@/shared/api/daoService';
import type { IDialogComponentProps } from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { invariant, MemberDataListItem } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { tokenDelegationDialogUtils } from './tokenDelegationDialogUtils';

export interface ITokenDelegationDialogParams {
    /**
     * Address of the token.
     */
    token: string;
    /**
     * Address to delegate the voting power to.
     */
    delegate?: string;
    /**
     * Network used for the transaction.
     */
    network: Network;
}

export interface ITokenDelegationDialogProps extends IDialogComponentProps<ITokenDelegationDialogParams> {}

export const TokenDelegationDialog: React.FC<ITokenDelegationDialogProps> = (props) => {
    const { location } = props;
    invariant(location.params != null, 'TokenDelegationDialog: required parameters must be set.');

    const { address } = useAccount();
    invariant(address != null, 'TokenDelegationDialog: user must be connected.');

    const { token, delegate = zeroAddress, network } = location.params;

    const { t } = useTranslations();
    const router = useRouter();

    const initialActiveStep = TransactionDialogStep.PREPARE;
    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({ initialActiveStep });

    const handlePrepareTransaction = () => tokenDelegationDialogUtils.buildTransaction(token, delegate);

    const onSuccessClick = () => {
        router.refresh();
    };

    return (
        <TransactionDialog
            title={t('app.plugins.token.tokenDelegationForm.dialog.title')}
            description={t('app.plugins.token.tokenDelegationForm.dialog.description')}
            submitLabel={t('app.plugins.token.tokenDelegationForm.dialog.button.submit')}
            stepper={stepper}
            prepareTransaction={handlePrepareTransaction}
            network={network}
            successLink={{
                label: t('app.plugins.token.tokenDelegationForm.dialog.button.success'),
                onClick: onSuccessClick,
            }}
        >
            <MemberDataListItem.Structure address={delegate} isDelegate={true} />
        </TransactionDialog>
    );
};
