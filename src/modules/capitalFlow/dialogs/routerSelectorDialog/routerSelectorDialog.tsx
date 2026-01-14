import {
    AvatarIcon,
    Dialog,
    IconType,
    invariant,
    Toggle,
    ToggleGroup,
} from '@aragon/gov-ui-kit';
import { useMemo, useState } from 'react';
import type { Network } from '@/shared/api/daoService';
import { PolicyStrategyType } from '@/shared/api/daoService';
import type { IDaoPolicy } from '@/shared/api/daoService/domain/daoPolicy';
import {
    type IDialogComponentProps,
    useDialogContext,
} from '@/shared/components/dialogProvider';
import { useTranslations } from '@/shared/components/translationsProvider';
import { CapitalFlowDialogId } from '../../constants/capitalFlowDialogId';
import type { IDispatchDialogParams } from '../dispatchDialog';

export interface IRouterSelectorDialogParams {
    policies: IDaoPolicy[];
    daoAddress: string;
    network: Network;
}

export interface IRouterSelectorDialogProps
    extends IDialogComponentProps<IRouterSelectorDialogParams> {}

export const RouterSelectorDialog: React.FC<IRouterSelectorDialogProps> = (
    props,
) => {
    const { location } = props;

    invariant(
        location.params != null,
        'RouterSelectorDialog: required parameters must be set.',
    );
    const { policies, network } = location.params;

    const { t } = useTranslations();
    const { open, close } = useDialogContext();

    const [activeTab, setActiveTab] = useState<'multi' | 'single'>('multi');

    const { multiPolicies, singlePolicies } = useMemo(() => {
        const multi = policies.filter(
            (policy) =>
                policy.strategy?.type === PolicyStrategyType.MULTI_DISPATCH,
        );
        const single = policies.filter(
            (policy) =>
                policy.strategy?.type !== PolicyStrategyType.MULTI_DISPATCH,
        );
        return { multiPolicies: multi, singlePolicies: single };
    }, [policies]);

    const shouldShowTabs = multiPolicies.length > 0;
    const displayedPolicies = shouldShowTabs
        ? activeTab === 'multi'
            ? multiPolicies
            : singlePolicies
        : policies;

    const handleTabChange = (value?: string) => {
        if (value) {
            setActiveTab(value as 'multi' | 'single');
        }
    };

    const handleSelectPolicy = (policy: IDaoPolicy) => {
        const routerSelectorParams = location.params;
        const params: IDispatchDialogParams = {
            policy,
            network,
            showBackButton: true,
            routerSelectorParams,
        };
        open(CapitalFlowDialogId.DISPATCH, { params, stack: true });
    };

    return (
        <>
            <Dialog.Header
                description={t(
                    'app.capitalFlow.routerSelectorDialog.description',
                )}
                onClose={close}
                title={t('app.capitalFlow.routerSelectorDialog.title')}
            />
            <Dialog.Content>
                {shouldShowTabs && (
                    <div className="flex flex-col gap-3 pt-2 pb-3">
                        <ToggleGroup
                            isMultiSelect={false}
                            onChange={handleTabChange}
                            value={activeTab}
                        >
                            <Toggle
                                label={t(
                                    'app.capitalFlow.routerSelectorDialog.multiTab',
                                )}
                                value="multi"
                            />
                            <Toggle
                                label={t(
                                    'app.capitalFlow.routerSelectorDialog.singleTab',
                                )}
                                value="single"
                            />
                        </ToggleGroup>
                    </div>
                )}
                <div className="flex flex-col gap-3 pb-6">
                    {displayedPolicies.map((policy) => (
                        <button
                            className="flex cursor-pointer items-center gap-6 rounded-xl border border-neutral-100 bg-neutral-0 px-6 py-6 shadow-neutral-sm transition-colors hover:border-neutral-200"
                            key={policy.address}
                            onClick={() => handleSelectPolicy(policy)}
                            type="button"
                        >
                            <div className="flex flex-1 items-baseline gap-2">
                                <span className="text-lg text-neutral-800">
                                    {policy.name ??
                                        t(
                                            'app.capitalFlow.routerSelectorDialog.unnamedPolicy',
                                        )}
                                </span>
                                {policy.policyKey && (
                                    <span className="text-lg text-neutral-500">
                                        {policy.policyKey}
                                    </span>
                                )}
                            </div>
                            {shouldShowTabs && activeTab === 'multi' && (
                                <span className="text-base text-neutral-500">
                                    <span className="text-neutral-800">
                                        {policy.strategy?.subRouters?.length ??
                                            0}
                                    </span>{' '}
                                    routers
                                </span>
                            )}
                            <AvatarIcon
                                icon={IconType.CHEVRON_RIGHT}
                                size="sm"
                                variant="primary"
                            />
                        </button>
                    ))}
                </div>
            </Dialog.Content>
        </>
    );
};
