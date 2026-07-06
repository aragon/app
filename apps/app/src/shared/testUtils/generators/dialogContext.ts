import type { IDialogContext } from '@/shared/components/dialogProvider';

export const generateDialogContext = (
    values?: Partial<IDialogContext>,
): IDialogContext => {
    const { locations, ...rest } = values ?? {};

    return {
        open: jest.fn(),
        close: jest.fn(),
        updateOptions: jest.fn(),
        locations: locations ?? [],
        ...rest,
    };
};
