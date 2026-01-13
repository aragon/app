import { addressUtils } from '@aragon/gov-ui-kit';
import { formatUnits, isAddress, isHex } from 'viem';
import {
    type IProposalAction,
    type IProposalActionWithdrawToken,
    ProposalActionType,
} from '@/modules/governance/api/governanceService';
import {
    type IDao,
    type IDaoPlugin,
    PluginInterfaceType,
} from '@/shared/api/daoService';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import type { IGaugeVoterCreateGaugeFormData } from '../../../../actions/gaugeVoter/components/gaugeVoterCreateGaugeActionCreate';
import { GaugeVoterActionType } from '../../../../actions/gaugeVoter/types/enum/gaugeVoterActionType';
import type { IGaugeVoterActionCreateGauge } from '../../../../actions/gaugeVoter/types/gaugeVoterActionCreateGauge';
import { MultisigProposalActionType } from '../../../../plugins/multisigPlugin/types';
import {
    type ITokenActionChangeSettings,
    type ITokenActionTokenMint,
    type ITokenPlugin,
    TokenProposalActionType,
} from '../../../../plugins/tokenPlugin/types';
import { tokenSettingsUtils } from '../../../../plugins/tokenPlugin/utils/tokenSettingsUtils';
import { smartContractService } from '../../api/smartContractService';

export interface IExportedAction {
    /**
     * Recipient address or contract address.
     */
    to: string;
    /**
     * ETH value to send (in wei).
     */
    value: number | string;
    /**
     * Encoded function call data (hex string).
     */
    data: string;
}

export interface IImportActionsResult {
    /**
     * Whether the import was successful.
     */
    success: boolean;
    /**
     * Parsed actions if successful.
     */
    actions?: IExportedAction[];
    /**
     * Translation key for error message if failed.
     */
    errorKey?: string;
}

class ProposalActionsImportExportUtils {
    /**
     * Exports actions to a JSON-serializable format
     *
     * @param actions - Array of proposal actions to export
     * @returns Array of exported actions with normalized values
     */
    exportActionsToJSON = (actions: IProposalAction[]): IExportedAction[] =>
        actions.map((action) => ({
            to: action.to,
            value:
                typeof action.value === 'bigint'
                    ? Number(action.value)
                    : Number(action.value || 0),
            data: action.data,
        }));

    /**
     * Downloads actions as a JSON file
     *
     * @param actions - Array of proposal actions to download
     * @param filename - Name of the file to download (default: 'actions.json')
     */
    downloadActionsAsJSON = (
        actions: IProposalAction[],
        filename = 'actions.json',
    ): void => {
        const exportedActions = this.exportActionsToJSON(actions);
        const jsonString = JSON.stringify(exportedActions, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    /**
     * Validates and parses imported JSON actions
     *
     * @param jsonString - JSON string containing actions array
     * @returns Result object with success status, parsed actions, or error key
     */
    validateAndParseActions = (jsonString: string): IImportActionsResult => {
        try {
            const parsed: unknown = JSON.parse(jsonString);

            if (!Array.isArray(parsed)) {
                return {
                    success: false,
                    errorKey:
                        'app.governance.createProposalForm.actionsImportExport.errors.invalidFormat',
                };
            }

            for (const action of parsed) {
                const errorKey = this.validateActionStructure(action);
                if (errorKey) {
                    return {
                        success: false,
                        errorKey,
                    };
                }
            }

            return {
                success: true,
                actions: parsed as IExportedAction[],
            };
        } catch {
            return {
                success: false,
                errorKey:
                    'app.governance.createProposalForm.actionsImportExport.errors.invalidJSON',
            };
        }
    };

    /**
     * Decodes imported actions using the smart contract service
     *
     * @param actions - Array of exported actions to decode
     * @param network - Network where the contracts exist
     * @param daoAddress - DAO address
     * @returns Promise resolving to array of decoded proposal actions
     */
    decodeActions = async (
        actions: IExportedAction[],
        dao: IDao,
    ): Promise<IProposalAction[]> => {
        const { network, address: daoAddress } = dao;
        const decodedActions =
            await smartContractService.decodeTransactionsLight({
                urlParams: {
                    network,
                    address: daoAddress,
                },
                body: actions,
            });

        return this.normalizeDecodedActions(decodedActions, dao);
    };

    /**
     * Normalize decoded actions to a format expected by create action input forms (basic views).
     */
    normalizeDecodedActions = (
        decodedActions: IProposalAction[],
        dao: IDao,
    ): IProposalAction[] => {
        const { plugins } = dao;

        return decodedActions.map((action) => {
            const meta = this.findPluginMetaByAddress(plugins, action.to);

            if (
                (
                    [
                        MultisigProposalActionType.MULTISIG_ADD_MEMBERS,
                        MultisigProposalActionType.MULTISIG_REMOVE_MEMBERS,
                    ] as string[]
                ).includes(action.type)
            ) {
                return this.normalizeMultisigMemberAction(action, meta);
            }

            if (action.type === TokenProposalActionType.UPDATE_VOTE_SETTINGS) {
                return this.normalizeTokenVoteSettingsAction(
                    action as ITokenActionChangeSettings,
                    meta,
                );
            }

            if (action.type === TokenProposalActionType.MINT) {
                return this.normalizeTokenMintAction(action, plugins);
            }

            if (
                action.type === ProposalActionType.TRANSFER ||
                action.type === ProposalActionType.TRANSFER_NATIVE
            ) {
                return this.normalizeTransferAction(
                    action as IProposalActionWithdrawToken,
                    dao,
                );
            }

            // For imported actions which are not handled explicitly above, set the type as `Unknown` so that the decoded view is usable.
            return {
                ...action,
                type: 'Unknown',
            };
        });
    };

    /**
     * Normalize gauge voter create gauge action
     */
    private normalizeGaugeVoterCreateGaugeAction = (
        action: IGaugeVoterActionCreateGauge,
        meta?: IDaoPlugin,
    ) => {
        const { gaugeMetadata, inputData } = action;
        const {
            name = '',
            description = '',
            avatar,
            links = [],
        } = gaugeMetadata ?? {};
        const gaugeAddress = inputData?.parameters[0].value as string;

        const gaugeDetails: IGaugeVoterCreateGaugeFormData = {
            gaugeAddress: {
                address: gaugeAddress,
            },
            name,
            description,
            resources: links,
            avatar: {
                url: ipfsUtils.cidToSrc(avatar),
            },
        };

        return {
            ...action,
            meta,
            gaugeDetails,
        };
    };

    /**
     * Normalize multisig member action (add/remove members)
     */
    private normalizeMultisigMemberAction = (
        action: IProposalAction,
        meta?: IDaoPlugin,
    ) => {
        if (!meta) {
            // If no meta, it means it's imported in another dao, in which case basic views cannot work.
            return {
                ...action,
                type: 'Unknown',
            };
        }

        // Parse members from action parameters
        const memberAddresses = (action.inputData?.parameters?.[0]
            ?.value as string[]) || [];
        const members = memberAddresses.map((address) => ({ address }));

        return {
            ...action,
            meta,
            members,
        };
    };

    /**
     * Normalize token vote settings action
     */
    private normalizeTokenVoteSettingsAction = (
        action: ITokenActionChangeSettings,
        meta?: IDaoPlugin,
    ) => {
        if (!meta) {
            // If no meta, it means it's imported in another dao, in which case basic views cannot work.
            return {
                ...action,
                type: 'Unknown',
            };
        }

        const { proposedSettings } = action;
        const { minProposerVotingPower, minParticipation, supportThreshold } =
            proposedSettings;

        return {
            ...action,
            proposedSettings: {
                ...proposedSettings,
                minParticipation:
                    tokenSettingsUtils.ratioToPercentage(minParticipation),
                supportThreshold:
                    tokenSettingsUtils.ratioToPercentage(supportThreshold),
                minProposerVotingPower: formatUnits(
                    BigInt(minProposerVotingPower),
                    (meta as ITokenPlugin).settings.token.decimals,
                ),
            },
            meta,
        };
    };

    /**
     * Normalize token mint action
     */
    private normalizeTokenMintAction = (
        action: IProposalAction,
        plugins: IDaoPlugin[],
    ) => {
        // In MINT, `to` is the address of the ERC20 token, not the address of the TV plugin!
        const meta = plugins.find(
            (plugin) =>
                plugin.interfaceType === PluginInterfaceType.TOKEN_VOTING &&
                addressUtils.isAddressEqual(
                    action.to,
                    (plugin as ITokenPlugin).settings?.token?.address,
                ),
        );

        if (!meta) {
            // If no meta, it means it's imported in another dao, in which case basic views cannot work.
            return {
                ...action,
                type: 'Unknown',
            };
        }

        const { receivers, token } = action as ITokenActionTokenMint;
        const { address, newBalance } = receivers;

        return {
            ...action,
            receiver: {
                address,
            },
            amount: formatUnits(BigInt(newBalance), token.decimals),
            meta,
        };
    };

    /**
     * Normalize transfer action (ERC20 and native)
     */
    private normalizeTransferAction = (
        action: IProposalActionWithdrawToken,
        dao: IDao,
    ) => {
        const { amount, token, inputData, to } = action;

        // For ERC20 transfers, receiver is in the first parameter (_to)
        // For native transfers, receiver is in the 'to' field
        const receiverAddress =
            (inputData?.parameters?.[0]?.value as string) || to;

        const formattedAmount = formatUnits(BigInt(amount), token.decimals);

        return {
            ...action,
            type: ProposalActionType.TRANSFER,
            receiver: {
                address: receiverAddress,
            },
            amount: formattedAmount,
            asset: {
                token: {
                    ...token,
                    network: dao.network,
                },
            },
        };
    };

    /**
     * Find plugin metadata by matching address
     */
    private findPluginMetaByAddress = (
        plugins: IDaoPlugin[],
        address: string,
    ) =>
        plugins.find((plugin) =>
            addressUtils.isAddressEqual(plugin.address, address),
        );

    /**
     * Validates a single action structure
     *
     * @param action - Action object to validate
     * @returns Error translation key if invalid, null if valid
     */
    private validateActionStructure = (action: unknown): string | null => {
        if (typeof action !== 'object' || action === null) {
            return 'app.governance.createProposalForm.actionsImportExport.errors.invalidFormat';
        }

        const actionObj = action as Record<string, unknown>;

        if (
            !('to' in actionObj && 'value' in actionObj && 'data' in actionObj)
        ) {
            return 'app.governance.createProposalForm.actionsImportExport.errors.invalidFormat';
        }

        if (typeof actionObj.to !== 'string' || !isAddress(actionObj.to)) {
            return 'app.governance.createProposalForm.actionsImportExport.errors.invalidAddress';
        }

        const isNumber =
            typeof actionObj.value === 'number' && actionObj.value >= 0;
        const isStringNumber =
            typeof actionObj.value === 'string' &&
            actionObj.value.length > 0 &&
            // allow decimal or 0x-prefixed hex since BigInt supports both
            /^(\d+|0x[0-9a-fA-F]+)$/.test(actionObj.value);

        if (!(isNumber || isStringNumber)) {
            return 'app.governance.createProposalForm.actionsImportExport.errors.invalidValue';
        }

        if (typeof actionObj.data !== 'string' || !isHex(actionObj.data)) {
            return 'app.governance.createProposalForm.actionsImportExport.errors.invalidData';
        }

        return null;
    };

    /**
     * Reads a file and returns its content as a string
     *
     * @param file - File to read
     * @returns Promise resolving to file content as string
     */
    readFileAsText = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
}

export const proposalActionsImportExportUtils =
    new ProposalActionsImportExportUtils();
