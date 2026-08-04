import { invariant, type ProposalActionComponent } from '@aragon/gov-ui-kit';
import type { IAllowedAction } from '@/modules/governance/api/executeSelectorsService';
import {
    type Network,
    useAllDaoPermissions,
    useDao,
} from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { useProposalActionsField } from '../../hooks/useProposalActionsField';
import { ActionComposer, actionComposerUtils } from '../actionComposer';
import type { IProposalActionData } from '../createProposalForm';
import { coreCustomActionComponents } from '../createProposalForm';
import { ProposalActionsEditList } from '../proposalActionsEditList';

export interface IProposalActionsEditorProps {
    /**
     * ID of the DAO the actions are composed for. When omitted the editor runs outside DAO context, so
     * no DAO-, plugin- or permission-specific actions are offered. Either `daoId` or `network` must be set.
     */
    daoId?: string;
    /**
     * Network the actions are composed for. Falls back to the DAO network when `daoId` is set.
     */
    network?: Network;
    /**
     * Action types to hide from the action composer, e.g. to stop an action from being nested into itself.
     */
    excludeActionTypes?: string[];
    /**
     * Actions the composer restricts its offering to. Leave undefined to offer every action.
     */
    allowedActions?: IAllowedAction[];
}

/**
 * Pairs the editable action list with the action composer on the `actions` field of the surrounding
 * form. Must be rendered inside a form context holding an `actions` array and a
 * `CreateProposalFormProvider`.
 */
export const ProposalActionsEditor: React.FC<IProposalActionsEditorProps> = (
    props,
) => {
    const { daoId, network, excludeActionTypes, allowedActions } = props;

    invariant(
        daoId != null || network != null,
        'ProposalActionsEditor: either daoId or network must be set.',
    );

    const { t } = useTranslations();
    const { data: dao } = useDao(
        { urlParams: { id: daoId ?? '' } },
        { enabled: daoId != null },
    );
    const { chainId } = useDaoChain({ daoId, network });

    const {
        actionsMerged,
        handleAddAction,
        handleRemoveAllActions,
        getArrayControls,
    } = useProposalActionsField();

    const { data: daoPermissions } = useAllDaoPermissions(
        {
            urlParams: {
                network: dao?.network as Network,
                daoAddress: dao?.address ?? '',
            },
        },
        { enabled: dao != null },
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

    // In DAO context the composer needs the DAO to build its plugin and permission actions, outside of
    // it there is nothing to wait for.
    const showActionComposer = daoId == null || dao != null;
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
                    allowedActions={allowedActions}
                    daoId={daoId}
                    daoPermissions={daoPermissions}
                    excludeActionTypes={excludeActionTypes}
                    hasActions={hasActions}
                    network={network}
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
