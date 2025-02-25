import { useConnectedWalletGuard } from '@/modules/application/hooks/useConnectedWalletGuard';
import { useDialogContext } from '@/shared/components/dialogProvider';
import type {
    DialogComponentProps,
    IDialogLocationOptions,
} from '@/shared/components/dialogProvider/dialogProvider.api';
import { useCallback, useRef } from 'react';

export const useOpenDialogWithConnectedWallet = <TParams extends DialogComponentProps = DialogComponentProps>() => {
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
