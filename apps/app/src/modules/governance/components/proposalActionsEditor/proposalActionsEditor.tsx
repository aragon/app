import type { ProposalActionComponent } from '@aragon/gov-ui-kit';
import { useAllDaoPermissions, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useProposalActionsField } from '../../hooks/useProposalActionsField';
import { ActionComposer, actionComposerUtils } from '../actionComposer';
import type { IProposalActionData } from '../createProposalForm';
import { coreCustomActionComponents } from '../createProposalForm';
import { ProposalActionsEditList } from '../proposalActionsEditList';

export interface IProposalActionsEditorProps {
    /**
     * ID of the DAO the actions are composed for.
     */
    daoId: string;
    /**
     * Action types to hide from the action composer, e.g. to stop an action from being nested into itself.
     */
    excludeActionTypes?: string[];
}

/**
 * Pairs the editable action list with the action composer on the `actions` field of the surrounding
 * form. Must be rendered inside a form context holding an `actions` array and a
 * `CreateProposalFormProvider`.
 */
export const ProposalActionsEditor: React.FC<IProposalActionsEditorProps> = (
    props,
) => {
    const { daoId, excludeActionTypes } = props;

    const { t } = useTranslations();
    const { data: dao } = useDao({ urlParams: { id: daoId } });
    const { chainId } = useDaoChain({ daoId });

    const {
        actionsMerged,
        handleAddAction,
        handleRemoveAllActions,
        getArrayControls,
    } = useProposalActionsField();

    const { data: daoPermissions } = useAllDaoPermissions({
        urlParams: { network: dao!.network, daoAddress: dao!.address },
    });

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
                    excludeActionTypes={excludeActionTypes}
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
