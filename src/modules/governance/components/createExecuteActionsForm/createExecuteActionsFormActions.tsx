import type { ProposalActionComponent } from '@aragon/gov-ui-kit';
import { useEffect } from 'react';
import { useDao, useDaoPermissions } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useProposalActionsField } from '../../hooks/useProposalActionsField';
import { ActionComposer, actionComposerUtils } from '../actionComposer';
import type { IProposalActionData } from '../createProposalForm';
import { coreCustomActionComponents } from '../createProposalForm';
import { ProposalActionsEditList } from '../proposalActionsEditList';

export interface ICreateExecuteActionsFormActionsProps {
    /**
     * ID of the DAO to execute actions on.
     */
    daoId: string;
}

export const CreateExecuteActionsFormActions: React.FC<
    ICreateExecuteActionsFormActionsProps
> = (props) => {
    const { daoId } = props;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { chainId } = useDaoChain({ daoId });

    const {
        actionsMerged,
        handleAddAction,
        handleRemoveAllActions,
        getArrayControls,
    } = useProposalActionsField();

    // TODO: implement useAllDaoPermissions
    const {
        data: daoPermissionsData,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useDaoPermissions({
        urlParams: { network: dao!.network, daoAddress: dao!.address },
        queryParams: { pageSize: 50 },
    });

    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage) {
            void fetchNextPage();
        }
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const daoPermissions = daoPermissionsData?.pages.flatMap(
        (page) => page.data,
    );

    const { pluginComponents } = actionComposerUtils.getDaoPluginActions(dao);
    const { components: permissionActionComponents } =
        actionComposerUtils.getDaoPermissionActions({
            t,
            permissions: daoPermissions,
        });

    const customActionComponents: Record<
        string,
        ProposalActionComponent<IProposalActionData>
    > = {
        ...coreCustomActionComponents,
        ...pluginComponents,
        ...permissionActionComponents,
    };

    const showActionComposer = dao != null;
    const hasActions = actionsMerged.length > 0;

    return (
        <div className="flex flex-col gap-y-10">
            <ProposalActionsEditList
                actionsMerged={actionsMerged}
                chainId={chainId}
                customActionComponents={customActionComponents}
                getArrayControls={getArrayControls}
            />
            {showActionComposer ? (
                <ActionComposer
                    daoId={daoId}
                    daoPermissions={daoPermissions}
                    hasActions={hasActions}
                    onAddAction={handleAddAction}
                    onRemoveAllActions={handleRemoveAllActions}
                />
            ) : (
                <p className="text-primary-400">
                    {t('app.governance.createProposalForm.actions.loading')}
                </p>
            )}
        </div>
    );
};
