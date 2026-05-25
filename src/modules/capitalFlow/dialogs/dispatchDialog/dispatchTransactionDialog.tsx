import { invariant } from '@aragon/gov-ui-kit';
import { useRouter } from 'next/navigation';
import { encodeFunctionData, type Hex, type TransactionReceipt } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
// LMM_DEMO_HACK: detect Lido Money Machine demo policies and route them to
// the Anvil-fork dispatch flow instead of wagmi.  Production DAOs always
// take the original code path below.
import { useIsLmmDemoDao } from '@/modules/flow/demo/lmmDemoConfig';
import type { Network } from '@/shared/api/daoService';
import type { IDaoPolicy } from '@/shared/api/daoService/domain/daoPolicy';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import {
    type ITransactionDialogStepMeta,
    TransactionDialog,
    TransactionDialogStep,
} from '@/shared/components/transactionDialog';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useStepper } from '@/shared/hooks/useStepper';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IRouterSelectorDialogParams } from '../routerSelectorDialog';
import { LmmDemoDispatchDialog } from './lmmDemoDispatchDialog';

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
    /**
     * Invoked as soon as the broadcast transaction is confirmed (one receipt). The
     * receiving side can use the tx hash to wire optimistic / indexer-lag UI without
     * waiting for the user to click through the final success step.
     */
    onDispatchSuccess?: (params: {
        txHash: string;
        receipt: TransactionReceipt;
    }) => void;
}

export interface IDispatchTransactionDialogProps
    extends IDialogComponentProps<IDispatchTransactionDialogParams> {}

export const dispatchAbi = [
    {
        name: 'dispatch',
        type: 'function',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
    },
] as const;

export const DispatchTransactionDialog: React.FC<
    IDispatchTransactionDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'DispatchTransactionDialog: required parameters must be set.',
    );
    const { policy } = location.params;

    // Route to the Anvil-fork demo dispatch flow when the policy belongs to
    // the LMM demo DAO.  `useIsLmmDemoDao` returns `undefined` until the
    // manifest has loaded — in that case we proceed with the production
    // wagmi flow rather than block the dialog.  All hooks below this branch
    // are inside `ProductionDispatchDialog` to keep the hook order stable.
    const isLmmDemo = useIsLmmDemoDao(policy.daoAddress);
    if (isLmmDemo === true) {
        return <LmmDemoDispatchDialog {...props} />;
    }
    return <ProductionDispatchDialog {...props} />;
};

const ProductionDispatchDialog: React.FC<IDispatchTransactionDialogProps> = (
    props,
) => {
    const { location } = props;
    invariant(
        location.params != null,
        'DispatchTransactionDialog: required parameters must be set.',
    );
    const {
        policy,
        network,
        showBackButton = false,
        routerSelectorParams,
        onDispatchSuccess,
    } = location.params;

    const { address } = useWalletAccount();
    invariant(
        address != null,
        'DispatchTransactionDialog: user must be connected.',
    );

    const { t } = useTranslations();
    const router = useRouter();
    const { open } = useDialogContext();

    const stepper = useStepper<
        ITransactionDialogStepMeta,
        TransactionDialogStep
    >({
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
            open(CapitalFlowDialogId.ROUTER_SELECTOR, {
                params: routerSelectorParams,
            });
        }
    };

    const handleReceipt = (receipt: TransactionReceipt) => {
        if (onDispatchSuccess == null) {
            return;
        }
        onDispatchSuccess({
            txHash: receipt.transactionHash,
            receipt,
        });
    };

    return (
        <TransactionDialog
            description={t(
                'app.capitalFlow.dispatchTransactionDialog.description',
            )}
            network={network}
            onSuccess={handleReceipt}
            prepareTransaction={prepareTransaction}
            stepper={stepper}
            submitLabel={t(
                'app.capitalFlow.dispatchTransactionDialog.dispatchButton',
            )}
            successLink={{
                label: t(
                    'app.capitalFlow.dispatchTransactionDialog.successButton',
                ),
                onClick: handleSuccess,
            }}
            title={t('app.capitalFlow.dispatchTransactionDialog.title', {
                policyName: policy.name,
            })}
        />
    );
};
