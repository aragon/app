import type { ITransactionRequest } from '@/shared/utils/transactionUtils';
import type { Hex, TransactionReceipt } from 'viem';

class PreparePluginUninstallationDialogUtils {
    private uninstallPluginProposalMetadata = {
        title: 'Apply plugin installation',
        summary: 'This proposal applies the plugin installation to create the new process',
    };

    buildPrepareUninstallationTransaction = (): Promise<ITransactionRequest> =>
        Promise.resolve({ data: '0x', value: BigInt(0), to: '0x' });

    getPluginUninstallationSetupData = (txReceipt: TransactionReceipt) => txReceipt.logs[0].address;

    buildApplyUninstallationProposalActions = (data: Hex): ITransactionRequest[] => [
        { data, value: BigInt(0), to: '0x' },
    ];

    prepareApplyUninstallationProposalMetadata = () => this.uninstallPluginProposalMetadata;
}

export const preparePluginUninstallationDialogUtils = new PreparePluginUninstallationDialogUtils();
