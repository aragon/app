import { type Network, useDaoPolicies } from '@/shared/api/daoService';
import { PolicyInterfaceType, PolicyStrategyType } from '@/shared/api/daoService/domain/daoPolicy';
import { useDialogContext } from '@/shared/components/dialogProvider';
import { Page } from '@/shared/components/page';
import { useTranslations } from '@/shared/components/translationsProvider';
import { AvatarIcon, Button, IconType } from '@aragon/gov-ui-kit';
import { useMemo } from 'react';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IDispatchDialogParams } from '../../dialogs/dispatchDialog';
import type { IRouterSelectorDialogParams } from '../../dialogs/routerSelectorDialog';

interface IDispatchPanelProps {
    daoAddress: string;
    network: Network;
}

export const DispatchPanel: React.FC<IDispatchPanelProps> = ({ daoAddress, network }) => {
    const { t } = useTranslations();
    const { open } = useDialogContext();
    const { data: policies } = useDaoPolicies({ urlParams: { network, daoAddress } });

    const routerPolicies = useMemo(() => {
        return (
            policies?.filter((policy) => {
                return (
                    policy.interfaceType === PolicyInterfaceType.ROUTER &&
                    (policy.strategy.type === PolicyStrategyType.ROUTER ||
                        policy.strategy.type === PolicyStrategyType.BURN_ROUTER ||
                        policy.strategy.type === PolicyStrategyType.MULTI_DISPATCH)
                );
            }) ?? []
        );
    }, [policies]);

    if (routerPolicies.length === 0) {
        return null;
    }

    const handleDispatchClick = () => {
        if (routerPolicies.length === 1) {
            // Single router - open dispatch dialog directly without back button
            const params: IDispatchDialogParams = { policy: routerPolicies[0], network, showBackButton: false };
            open(CapitalFlowDialogId.DISPATCH, { params });
        } else {
            // Multiple routers - open router selector first
            const params: IRouterSelectorDialogParams = { policies: routerPolicies, daoAddress, network };
            open(CapitalFlowDialogId.ROUTER_SELECTOR, { params });
        }
    };

    return (
        <Page.AsideCard title={t('app.capitalFlow.dispatchPanel.title')}>
            <div className="flex flex-col gap-6">
                <p className="text-base text-neutral-500">{t('app.capitalFlow.dispatchPanel.description')}</p>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <AvatarIcon icon={IconType.APP_TRANSACTIONS} variant="primary" size="sm" />
                        <span className="text-base text-neutral-800">
                            {t('app.capitalFlow.dispatchPanel.routingTitle')}
                        </span>
                    </div>
                    <p className="pl-9 text-sm text-neutral-500">
                        {t('app.capitalFlow.dispatchPanel.routingDescription')}
                    </p>
                </div>
                <Button variant="primary" size="md" onClick={handleDispatchClick} className="w-full">
                    {t('app.capitalFlow.dispatchPanel.dispatchButton')}
                </Button>
            </div>
        </Page.AsideCard>
    );
};
