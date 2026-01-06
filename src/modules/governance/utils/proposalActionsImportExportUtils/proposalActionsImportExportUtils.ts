import { isAddress, isHex } from 'viem';
import type { IProposalAction } from '@/modules/governance/api/governanceService';
import type { IProposalActionData } from '../../components/createProposalForm';

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
     * Exports actions to a JSON-serializable format.
     * Prefers pinned IPFS data over action.data when available for metadata actions.
     */
    exportActionsToJSON = (actions: IProposalAction[]): IExportedAction[] =>
        actions.map((action) => {
            let exportData = action.data;

            const actionWithMetadata = action as IProposalActionData;
            if (
                actionWithMetadata.ipfsMetadata?.pinnedData &&
                actionWithMetadata.ipfsMetadata.pinnedData !== '0x'
            ) {
                exportData = actionWithMetadata.ipfsMetadata.pinnedData;
            }

            return {
                to: action.to,
                value:
                    typeof action.value === 'bigint'
                        ? Number(action.value)
                        : Number(action.value || 0),
                data: exportData,
            };
        });

    /**
     * Downloads actions as a JSON file.
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
     * Validates and parses imported JSON actions.
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
     * Validates a single action structure.
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
     * Reads a file and returns its content as a string.
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
