import type { IDialogContext } from '@/shared/components/dialogProvider';

export const generateDialogContext = (values?: Partial<IDialogContext>): IDialogContext => ({
    open: jest.fn(),
    close: jest.fn(),
    updateOptions: jest.fn(),
    ...values,
});
