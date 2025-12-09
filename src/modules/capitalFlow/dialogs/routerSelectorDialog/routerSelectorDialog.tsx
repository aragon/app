import { type Network } from '@/shared/api/daoService';
import { type IDaoPolicy } from '@/shared/api/daoService/domain/daoPolicy';
import { useDialogContext, type IDialogComponentProps } from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, Dialog, IconType, invariant } from '@aragon/gov-ui-kit';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IDispatchDialogParams } from '../dispatchDialog';

export interface IRouterSelectorDialogParams {
    policies: IDaoPolicy[];
    daoAddress: string;
    network: Network;
}

export interface IRouterSelectorDialogProps extends IDialogComponentProps<IRouterSelectorDialogParams> {}

export const RouterSelectorDialog: React.FC<IRouterSelectorDialogProps> = (props) => {
    const { location } = props;

    invariant(location.params != null, 'RouterSelectorDialog: required parameters must be set.');
    const { policies, network } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const handleSelectPolicy = (policy: IDaoPolicy) => {
        const routerSelectorParams = location.params;
        const params: IDispatchDialogParams = { policy, network, showBackButton: true, routerSelectorParams };
        open(CapitalFlowDialogId.DISPATCH, { params, stack: true });
    };

    return (
        <>
            <Dialog.Header
                title={t('app.capitalFlow.routerSelectorDialog.title')}
                description={t('app.capitalFlow.routerSelectorDialog.description')}
                onClose={close}
            />
            <Dialog.Content>
                <div className="flex flex-col gap-3 pb-6">
                    {policies.map((policy, index) => (
                        <button
                            type="button"
                            key={policy.address}
                            className="bg-neutral-0 shadow-neutral-sm flex items-center gap-6 rounded-xl border border-neutral-100 px-6 py-6 transition-colors hover:border-neutral-200"
                            onClick={() => handleSelectPolicy(policy)}
                        >
                            <div className="flex flex-1 items-baseline gap-2">
                                <span className="text-lg text-neutral-800">
                                    {policy.name ?? t('app.capitalFlow.routerSelectorDialog.unnamedPolicy')}
                                </span>
                                {policy.policyKey && (
                                    <span className="text-lg text-neutral-500">{policy.policyKey}</span>
                                )}
                            </div>
                            <span className="text-base text-neutral-500">
                                <span className="text-neutral-800">{index + 1}</span> of {policies.length}
                            </span>
                            <AvatarIcon icon={IconType.CHEVRON_RIGHT} variant="primary" size="sm" />
                        </button>
                    ))}
                </div>
            </Dialog.Content>
        </>
    );
};
