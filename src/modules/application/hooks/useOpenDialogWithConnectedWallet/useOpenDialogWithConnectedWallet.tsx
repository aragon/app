import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type {
    DialogComponentProps,
    IDialogLocationOptions,
} from '@/shared/components/dialogProvider/dialogProvider.api';
import { useCallback, useRef } from 'react';

export const useOpenDialogWithConnectedWallet = <TParams extends DialogComponentProps = DialogComponentProps>() => {
    // Since dialog params are not available on hook call (i.e. when dialog is opened on form submit), we need to store
    // them in a ref to be able to use them later when the wallet connection succeeds.
    const dialogParamsRef = useRef<{ dialogId: string; options: IDialogLocationOptions<TParams> | undefined }>(null);

    const { open } = useDialogContext();
    const { check: promptWalletConnection } = useConnectedWalletGuard({
        onSuccess: () => {
            // onSuccess callback is called either when the wallet is already connected or when the user connects it!
            if (!dialogParamsRef.current) {
                return;
            }

            const { dialogId, options } = dialogParamsRef.current;
            open(dialogId, options);
        },
        onError: () => {
            dialogParamsRef.current = null;
        },
    });

    const openWithConnectedWallet = useCallback(
        (dialogId: string, options?: IDialogLocationOptions<TParams>) => {
            // This will trigger one of the following scenarios:
            //   1. If the wallet is already connected, the dialog will be opened immediately.
            //   2. If the wallet is not connected, the user will be prompted to connect it.
            //      2.1. If the connection is successful, the dialog will be opened.
            //      2.2. If the connection fails, the dialog will not be opened.
            dialogParamsRef.current = { dialogId, options };
            promptWalletConnection();
        },
        [promptWalletConnection],
    );

    return openWithConnectedWallet;
};
