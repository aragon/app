import {
    Button,
    Card,
    Dialog,
    Icon,
    IconType,
    invariant,
    Spinner,
} from '@aragon/gov-ui-kit';
import { useCallback, useEffect, useState } from 'react';
import { encodeFunctionData } from 'viem';
import { useAccount } from 'wagmi';
import type { Network } from '@/shared/api/daoService';
import { daoService } from '@/shared/api/daoService';
import type { IDaoPolicy } from '@/shared/api/daoService/domain/daoPolicy';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { networkDefinitions } from '@/shared/constants/networkDefinitions';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { SimulationFlowVisualization } from '../../components/simulationFlowVisualization';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IProcessedSimulation } from '../../utils/simulationTypes';
import type { IRouterSelectorDialogParams } from '../routerSelectorDialog';
import type { IDispatchTransactionDialogParams } from './dispatchTransactionDialog';
import { dispatchAbi } from './dispatchTransactionDialog';

export interface IDispatchSimulationDialogParams {
    policy: IDaoPolicy;
    network: Network;
    showBackButton?: boolean;
    routerSelectorParams?: IRouterSelectorDialogParams;
}

export interface IDispatchSimulationDialogProps
    extends IDialogComponentProps<IDispatchSimulationDialogParams> {}

export const DispatchSimulationDialog: React.FC<
    IDispatchSimulationDialogProps
> = (props) => {
    const { location } = props;

    invariant(
        location.params != null,
        'DispatchSimulationDialog: required parameters must be set.',
    );

    const {
        policy,
        network,
        showBackButton = false,
        routerSelectorParams,
    } = location.params;

    const { t } = useTranslations();
    const { close, open } = useDialogContext();
    const { address } = useAccount();
    const { buildEntityUrl } = useDaoChain({ network });

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [simulation, setSimulation] = useState<IProcessedSimulation | null>(
        null,
    );

    const { tenderlySupport } = networkDefinitions[network];

    const simulateDispatch = useCallback(async () => {
        if (!address) {
            setError(t('app.capitalFlow.dispatchSimulationDialog.noWallet'));
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSimulation(null);

        try {
            const data = encodeFunctionData({
                abi: dispatchAbi,
                functionName: 'dispatch',
            });

            const result = await daoService.simulateDispatch({
                urlParams: {
                    network,
                    policyAddress: policy.address,
                },
                body: {
                    from: address,
                    data,
                },
            });

            setSimulation(result);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            setSimulation(null);
        } finally {
            setIsLoading(false);
        }
    }, [address, network, policy.address, t]);

    useEffect(() => {
        if (!tenderlySupport) {
            setError(t('app.capitalFlow.dispatchSimulationDialog.noTenderly'));
            setIsLoading(false);
            return;
        }

        void simulateDispatch();
    }, [tenderlySupport, simulateDispatch, t]);

    const handleContinue = () => {
        if (isLoading || error != null || simulation == null) {
            return;
        }

        const params: IDispatchTransactionDialogParams = {
            policy,
            network,
            showBackButton,
            routerSelectorParams,
        };

        close(CapitalFlowDialogId.DISPATCH_SIMULATION);
        open(CapitalFlowDialogId.DISPATCH_TRANSACTION, {
            params,
            stack: true,
        });
    };

    const handleBack = () => {
        close(CapitalFlowDialogId.DISPATCH_SIMULATION);
    };

    const handleRetry = () => {
        setError(null);
        setSimulation(null);
        void simulateDispatch();
    };

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.capitalFlow.dispatchSimulationDialog.description',
                )}
                onClose={() => close(CapitalFlowDialogId.DISPATCH_SIMULATION)}
                title={t('app.capitalFlow.dispatchSimulationDialog.title', {
                    policyName: policy.name,
                })}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-4 pb-6">
                    {/* Loading State */}
                    {isLoading && (
                        <Card className="flex flex-col items-center justify-center gap-4 p-8">
                            <Spinner size="lg" variant="primary" />
                            <p className="text-neutral-500">
                                {t(
                                    'app.capitalFlow.dispatchSimulationDialog.loading',
                                )}
                            </p>
                        </Card>
                    )}

                    {/* Error State */}
                    {error && !isLoading && (
                        <Card
                            className="flex flex-col gap-3 border border-critical-200 bg-critical-50 p-4"
                            role="alert"
                        >
                            <div className="flex items-start gap-3">
                                <Icon
                                    className="mt-0.5 shrink-0 text-critical-500"
                                    icon={IconType.WARNING}
                                    size="md"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-critical-700 leading-tight">
                                        {t(
                                            'app.capitalFlow.dispatchSimulationDialog.failed',
                                        )}
                                    </p>
                                    <p className="mt-1 break-words text-critical-600 text-sm leading-tight">
                                        {error}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleRetry}
                                    size="sm"
                                    variant="secondary"
                                >
                                    {t(
                                        'app.capitalFlow.dispatchSimulationDialog.retry',
                                    )}
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Success State */}
                    {simulation && !isLoading && !error && (
                        <SimulationFlowVisualization
                            buildEntityUrl={buildEntityUrl}
                            simulation={simulation}
                        />
                    )}
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t(
                        'app.capitalFlow.dispatchSimulationDialog.continue',
                    ),
                    disabled: isLoading || error != null || simulation == null,
                    onClick: handleContinue,
                }}
                secondaryAction={
                    showBackButton
                        ? {
                              label: t(
                                  'app.capitalFlow.dispatchSimulationDialog.backButton',
                              ),
                              onClick: handleBack,
                          }
                        : {
                              label: t(
                                  'app.capitalFlow.dispatchSimulationDialog.cancel',
                              ),
                              onClick: handleBack,
                          }
                }
                variant="wizard"
            />
        </>
    );
};
