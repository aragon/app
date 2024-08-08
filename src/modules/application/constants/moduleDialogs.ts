import { ModuleDialogs } from '@/shared/components/dialogProvider';
import { ConnectWalletDialog } from '../dialogs/connectWalletDialog';

export enum ApplicationDialog {
    CONNECT_WALLET = 'CONNECT_WALLET',
}

export const applicationDialogs: ModuleDialogs<ApplicationDialog> = {
    [ApplicationDialog.CONNECT_WALLET]: ConnectWalletDialog,
};
