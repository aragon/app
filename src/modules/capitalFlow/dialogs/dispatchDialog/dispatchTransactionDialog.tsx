import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { encodeFunctionData, type Hex } from 'viem';
import { useAccount } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import type { IDaoPolicy } from '@/shared/api/daoService/domain/daoPolicy';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { type ITransactionDialogStepMeta, TransactionDialog, TransactionDialogStep } from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IRouterSelectorDialogParams } from '../routerSelectorDialog';

export interface IDispatchTransactionDialogParams {
    policy: IDaoPolicy;
    network: Network;
    /**
     * Whether we came from router selector (multiple routers).
     * If true, success will return to router selector. If false, success will close all dialogs.
     */
    showBackButton?: boolean;
    /**
     * Data needed to reopen router selector after successful dispatch.
     * Only used when showBackButton is true.
     */
    routerSelectorParams?: IRouterSelectorDialogParams;
}

export interface IDispatchTransactionDialogProps extends IDialogComponentProps<IDispatchTransactionDialogParams> {}

const dispatchAbi = [
    {
        name: 'dispatch',
        type: 'function',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

export const DispatchTransactionDialog: React.FC<IDispatchTransactionDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'DispatchTransactionDialog: required parameters must be set.');
    const { policy, network, showBackButton = false, routerSelectorParams } = location.params;

    const { address } = useAccount();
    invariant(address != null, 'DispatchTransactionDialog: user must be connected.');

    const { t } = useTranslations();
    const router = useRouter();
    const { open } = useDialogContext();

    const stepper = useStepper<ITransactionDialogStepMeta, TransactionDialogStep>({
        initialActiveStep: TransactionDialogStep.PREPARE,
    });

    const prepareTransaction = () => {
        const data = encodeFunctionData({
            abi: dispatchAbi,
            functionName: 'dispatch',
        });

        return Promise.resolve({
            to: policy.address as Hex,
            data,
            value: BigInt(0),
        });
    };

    const handleSuccess = () => {
        router.refresh();

        // TransactionDialogFooter already closes all dialogs before calling this
        // So we need to reopen the router selector if we came from there
        if (showBackButton && routerSelectorParams) {
            open(CapitalFlowDialogId.ROUTER_SELECTOR, { params: routerSelectorParams });
        }
    };

    return (
        <TransactionDialog
            description={t('app.capitalFlow.dispatchTransactionDialog.description')}
            network={network}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t('app.capitalFlow.dispatchTransactionDialog.dispatchButton')}
            successLink={{
                label: t('app.capitalFlow.dispatchTransactionDialog.successButton'),
                onClick: handleSuccess,
            }}
            title={t('app.capitalFlow.dispatchTransactionDialog.title', { policyName: policy.name })}
        />
    );
};
