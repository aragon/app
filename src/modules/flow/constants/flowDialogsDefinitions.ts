import type { IDialogComponentDefinitions } from '@/shared/components/dialogProvider';
import { ConfirmDispatchDialog } from '../dialogs/confirmDispatchDialog';
import { FlowDialogId } from './flowDialogId';

export const flowDialogsDefinitions: Record<
    FlowDialogId,
    IDialogComponentDefinitions
> = {
    [FlowDialogId.CONFIRM_DISPATCH]: {
        Component: ConfirmDispatchDialog,
        size: 'md',
    },
};
