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
            dialogParamsRef.current = { dialogId, options };
            promptWalletConnection();
        },
        [promptWalletConnection],
    );

    return openWithConnectedWallet;
};
