import type { ICreateProposalFormData, IProposalActionData } from '@/modules/governance/components/createProposalForm';
import type { IPublishProposalDialogParams } from '@/modules/governance/dialogs/publishProposalDialog';
import type { ICreateProposalStartDateForm } from '@/modules/governance/utils/createProposalUtils';
import type { IDaoPlugin } from '@/shared/api/daoService';
import { permissionTransactionUtils } from '@/shared/utils/permissionTransactionUtils';
import type { Hex } from 'viem';

class AdminUninstallSelectProcessDialogUtils {
    private permissionIds = {
        ROOT_PERMISSION: 'ROOT_PERMISSION',
    };

    private proposalMetadata = {
        title: 'Remove all admins',
        summary:
            'This proposal intends to remove all admin control of the DAO. The action will revoke their permission to execute transactions on behalf of the DAO. By passing the proposal, it signifies that this governance process is configured properly and is able to execute on behalf of the DAO now.',
    };

    prepareProposalMetadata = () => this.proposalMetadata;

    private buildRevokeAction(pluginSetupProcessor: Hex, daoAddress: Hex, daoId: string): IProposalActionData {
        const rawAction = permissionTransactionUtils.buildRevokePermissionTransaction({
            where: daoAddress,
            who: pluginSetupProcessor,
            what: this.permissionIds.ROOT_PERMISSION,
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

    private buildProposalValues(
        pluginSetupProcessor: Hex,
        daoAddress: Hex,
        daoId: string,
    ): ICreateProposalFormData & ICreateProposalStartDateForm {
        const revokeAction = this.buildRevokeAction(pluginSetupProcessor, daoAddress, daoId);

        return {
            ...this.prepareProposalMetadata(),
            body: '',
            addActions: true,
            resources: [],
            actions: [revokeAction],
            startTimeMode: 'now',
        };
    }

    buildProposalParams(
        plugin: IDaoPlugin,
        pluginSetupProcessor: Hex,
        daoAddress: Hex,
        daoId: string,
    ): IPublishProposalDialogParams {
        return {
            values: this.buildProposalValues(pluginSetupProcessor, daoAddress, daoId),
            daoId,
            pluginAddress: plugin.address,
            prepareActions: {},
        };
    }
}

export const adminUninstallSelectProcessDialogUtils = new AdminUninstallSelectProcessDialogUtils();
