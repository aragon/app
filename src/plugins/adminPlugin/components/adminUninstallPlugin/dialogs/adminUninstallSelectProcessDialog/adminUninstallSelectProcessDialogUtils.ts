import type { ICreateProposalFormData, IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ICreateProposalStartDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';

class AdminUninstallSelectProcessDialogUtils {
    private proposalMetadata = {
        title: 'Remove all admins',
        summary:
            'This proposal intends to remove all admin control of the DAO. The action will revoke their permission to execute transactions on behalf of the DAO. By passing the proposal, it signifies that this governance process is configured properly and is able to execute on behalf of the DAO now.',
    };

    private buildRevokeAction(pluginSetupProcessor: Hex, daoAddress: Hex, daoId: string): IProposalActionData {
        const rawAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: pluginSetupProcessor,
            what: 'ROOT_PERMISSION',
            to: daoAddress,
        });

        return {
            ...rawAction,
            from: daoAddress,
            type: 'function',
            inputData: null,
            daoId,
            meta: undefined,
        };
    }

    public buildProposalParams(
        plugin: IDaoPlugin,
        daoAddress: Hex,
        daoId: string,
        pluginSetupProcessor: Hex,
    ): IPublishProposalDialogParams {
        const revokeAction = this.buildRevokeAction(pluginSetupProcessor, daoAddress, daoId);

        const values: ICreateProposalFormData & ICreateProposalStartDateForm = {
            title: this.proposalMetadata.title,
            summary: this.proposalMetadata.summary,
            body: '',
            addActions: true,
            resources: [],
            actions: [revokeAction],
            startTimeMode: 'now',
        };

        return {
            values,
            daoId,
            pluginAddress: plugin.address,
            prepareActions: {},
        };
    }
}

export const adminUninstallSelectProcessDialogUtils = new AdminUninstallSelectProcessDialogUtils();
