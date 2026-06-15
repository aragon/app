import { invariant } from '@aragon/gov-ui-kit';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { encodeFunctionData, type Hex, type TransactionReceipt } from 'viem';
import { useWalletAccount } from '@/modules/application/hooks/useWalletAccount';
// LMM_DEMO_HACK: detect Lido Money Machine demo policies and route them to
// the Anvil-fork dispatch flow instead of wagmi.  Production DAOs always
// take the original code path below.
import { LMM_DEMO_MODE } from '@/modules/flow/demo/lmmDemoConfig';
import { useIsLmmDemoDao } from '@/modules/flow/demo/useLmmManifest';
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

// LMM_DEMO_HACK: lazy-load the demo dialog so its imports (anvil deployer
// key, vendored preview-lib, viem/private-key signing) never land in the
// production bundle when LMM_DEMO_MODE=0.  `ssr: false` keeps it
// client-only, matching the original eager import.
const LmmDemoDispatchDialog = LMM_DEMO_MODE
    ? dynamic(
          () =>
              import('./lmmDemoDispatchDialog').then(
                  (m) => m.LmmDemoDispatchDialog,
              ),
          { ssr: false },
      )
    : null;

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
    // manifest has loaded — when demo mode is on, we wait (show nothing)
    // rather than briefly mount the production wagmi flow.  All hooks
    // below this branch are inside `ProductionDispatchDialog` to keep
    // the hook order stable.
    const isLmmDemo = useIsLmmDemoDao(policy.daoAddress);
    if (LMM_DEMO_MODE && LmmDemoDispatchDialog != null) {
        if (isLmmDemo === undefined) {
            // Manifest still loading — render nothing so a demo DAO never
            // briefly opens the production wallet dialog while the
            // manifest fetch is in flight.
            return null;
        }
        if (isLmmDemo) {
            return <LmmDemoDispatchDialog {...props} />;
        }
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
