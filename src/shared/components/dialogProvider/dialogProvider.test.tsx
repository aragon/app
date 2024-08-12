import { testLogger } from '@/test/utils';
import { act, render, renderHook, screen } from '@testing-library/react';
import { DialogProvider, type IDialogProviderProps, useDialogContext } from './dialogProvider';

describe('<DialogProvider /> component', () => {
    const createTestComponent = (props?: Partial<IDialogProviderProps>) => {
        const completeProps: IDialogProviderProps = { ...props };

        return <DialogProvider {...completeProps} />;
    };

    it('renders the children component', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    describe('useDialogContext hook', () => {
        it('throws error when used outside the DialogProvider', () => {
            testLogger.suppressErrors();
            expect(() => renderHook(() => useDialogContext())).toThrow();
        });

        it('returns the dialog context values', () => {
            const { result } = renderHook(() => useDialogContext(), { wrapper: createTestComponent });
            expect(result.current.open).toBeDefined();
            expect(result.current.close).toBeDefined();
            expect(result.current.location).not.toBeDefined();
        });

        it('updates active location on dialog open and close', () => {
            const newLocation = { id: 'dialog-id', params: { customDialogParams: 'value' } };
            const { result } = renderHook(() => useDialogContext(), { wrapper: createTestComponent });
            expect(result.current.location).not.toBeDefined();

            act(() => result.current.open(newLocation.id, { params: newLocation.params }));
            expect(result.current.location).toEqual(newLocation);

            act(() => result.current.close());
            expect(result.current.location).not.toBeDefined();
        });
    });
});
