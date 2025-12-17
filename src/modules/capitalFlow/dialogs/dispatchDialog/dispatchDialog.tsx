import { addressUtils, Card, ChainEntityType, DefinitionList, Dialog, invariant } from '@aragon/gov-ui-kit';
import type { Network } from '@/shared/api/daoService';
import { type IDaoPolicy, PolicyStrategyModelType } from '@/shared/api/daoService/domain/daoPolicy';
import { type IDialogComponentProps, useDialogContext } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IRouterSelectorDialogParams } from '../routerSelectorDialog';
import type { IDispatchTransactionDialogParams } from './dispatchTransactionDialog';

export interface IDispatchDialogParams {
    policy: IDaoPolicy;
    network: Network;
    /**
     * Whether to show the back button to return to router list.
     * Should be true when opened from router selector, false when opened directly.
     */
    showBackButton?: boolean;
    /**
     * Data needed to reopen router selector after successful dispatch.
     * Only used when showBackButton is true.
     */
    routerSelectorParams?: IRouterSelectorDialogParams;
}

export interface IDispatchDialogProps extends IDialogComponentProps<IDispatchDialogParams> {}

export const DispatchDialog: React.FC<IDispatchDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'DispatchDialog: required parameters must be set.');
    const { policy, network, showBackButton = false, routerSelectorParams } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();
    const { buildEntityUrl } = useDaoChain({ network });

    const handleDispatch = () => {
        const params: IDispatchTransactionDialogParams = {
            policy,
            network,
            showBackButton,
            routerSelectorParams,
        };
        open(CapitalFlowDialogId.DISPATCH_TRANSACTION, { params, stack: true });
    };

    const handleBack = () => {
        close(CapitalFlowDialogId.DISPATCH);
    };

    // Extract data from strategy
    const token = policy.strategy.source?.token;
    const model = policy.strategy.model;
    const recipientsCount = model?.type === PolicyStrategyModelType.RATIO && 'recipients' in model ? model.recipients.length : undefined;

    return (
        <>
            <Dialog.Header
                description={t('app.capitalFlow.dispatchDialog.description')}
                onClose={close}
                title={t('app.capitalFlow.dispatchDialog.title', {
                    policyName: policy.name,
                })}
            />
            <Dialog.Content>
                <div className="pb-6">
                    <Card className="flex flex-col gap-4 p-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg text-neutral-800">{policy.name}</span>
                                {policy.policyKey && <span className="text-lg text-neutral-500">{policy.policyKey}</span>}
                            </div>
                            {policy.description && <p className="text-base text-neutral-500">{policy.description}</p>}
                        </div>

                        <DefinitionList.Container>
                            {token && (
                                <DefinitionList.Item
                                    copyValue={token.address}
                                    link={{
                                        href: buildEntityUrl({
                                            type: ChainEntityType.ADDRESS,
                                            id: token.address,
                                        }),
                                    }}
                                    term={t('app.capitalFlow.dispatchDialog.token')}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span>{addressUtils.truncateAddress(token.address)}</span>
                                        <span className="text-neutral-400 text-sm">
                                            {token.name} ({token.symbol})
                                        </span>
                                    </div>
                                </DefinitionList.Item>
                            )}
                            {recipientsCount != null && (
                                <DefinitionList.Item term={t('app.capitalFlow.dispatchDialog.recipients')}>
                                    {t('app.capitalFlow.dispatchDialog.recipientsCount', {
                                        count: recipientsCount,
                                    })}
                                </DefinitionList.Item>
                            )}
                        </DefinitionList.Container>
                    </Card>
                </div>
            </Dialog.Content>
            <Dialog.Footer
                primaryAction={{
                    label: t('app.capitalFlow.dispatchDialog.dispatchButton'),
                    onClick: handleDispatch,
                }}
                secondaryAction={
                    showBackButton
                        ? {
                              label: t('app.capitalFlow.dispatchDialog.backButton'),
                              onClick: handleBack,
                          }
                        : undefined
                }
                variant="wizard"
            />
        </>
    );
};
