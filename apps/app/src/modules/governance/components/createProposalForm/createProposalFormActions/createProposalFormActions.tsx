import { addressUtils, type ProposalActionComponent } from '@aragon/gov-ui-kit';
import { useAllAllowedActions } from '@/modules/governance/api/executeSelectorsService';
import { useAllDaoPermissions, useDao } from '@/shared/api/daoService';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useDaoChain } from '@/shared/hooks/useDaoChain';
import { daoUtils } from '@/shared/utils/daoUtils';
import { useDownloadProposalActions } from '../../../hooks/useDownloadProposalActions';
import { useProposalActionsField } from '../../../hooks/useProposalActionsField';
import { ActionComposer, actionComposerUtils } from '../../actionComposer';
import { ProposalActionsEditList } from '../../proposalActionsEditList';
import type { IProposalActionData } from '../createProposalFormDefinitions';
import { coreCustomActionComponents } from './coreCustomActionComponents';

export interface ICreateProposalFormActionsProps {
    /**
     * ID of the DAO.
     */
    daoId: string;
    /**
     * Address of the plugin to create the proposal for.
     */
    pluginAddress: string;
}

export const CreateProposalFormActions: React.FC<
    ICreateProposalFormActionsProps
> = (props) => {
    const { daoId, pluginAddress } = props;

    const daoUrlParams = { id: daoId };
    const { data: dao } = useDao({ urlParams: daoUrlParams });

    const [processPlugin] = daoUtils.getDaoPlugins(dao, {
        pluginAddress,
        includeLinkedAccounts: true,
    })!;
    const hasConditionalPermissions = processPlugin.conditionAddress != null;

    // Resolve the target DAO from the plugin.
    // If the plugin has a daoAddress (linked account targeting), use it; otherwise target the parent DAO.
    const targetDaoAddress = processPlugin.daoAddress ?? dao!.address;
    const isParentTarget = addressUtils.isAddressEqual(
        targetDaoAddress,
        dao!.address,
    );
    const targetDaoId = isParentTarget
        ? daoId
        : `${dao!.network}-${targetDaoAddress}`;

    // Fetch the target DAO so that the ActionComposer has it available.
    // When targeting the parent DAO this resolves instantly from cache.
    const { data: targetDao } = useDao({ urlParams: { id: targetDaoId } });

    const { t } = useTranslations();
    const { chainId } = useDaoChain({ daoId });

    const {
        actionsMerged,
        handleAddAction,
        handleRemoveAllActions,
        getArrayControls,
    } = useProposalActionsField();

    const { data: allowedActions } = useAllAllowedActions(
        { urlParams: { network: dao!.network, pluginAddress }, chainId },
        { enabled: hasConditionalPermissions },
    );
    const { data: daoPermissions } = useAllDaoPermissions({
        urlParams: { network: dao!.network, daoAddress: targetDaoAddress },
    });

    const { isPinning, hasPinErrors, handleDownloadActions } =
        useDownloadProposalActions({ daoId });

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

    const showActionComposer =
        (!hasConditionalPermissions || allowedActions != null) &&
        targetDao != null;
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
                    daoId={targetDaoId}
                    daoPermissions={daoPermissions}
                    hasActions={hasActions}
                    hasPinErrors={hasPinErrors}
                    isPinning={isPinning}
                    onAddAction={handleAddAction}
                    onDownloadActions={handleDownloadActions}
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
