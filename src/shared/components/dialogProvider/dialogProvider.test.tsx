import { act, render, renderHook, screen } from '@testing-library/react';
import { testLogger } from '@/test/utils';
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
            const { result } = renderHook(() => useDialogContext(), {
                wrapper: createTestComponent,
            });
            expect(result.current.open).toBeDefined();
            expect(result.current.close).toBeDefined();
            expect(result.current.locations).toEqual([]);
        });

        it('updates active location on dialog open and close', () => {
            const newLocation = {
                id: 'dialog-id',
                params: { customDialogParams: 'value' },
            };
            const { result } = renderHook(() => useDialogContext(), {
                wrapper: createTestComponent,
            });
            expect(result.current.locations).toEqual([]);

            act(() =>
                result.current.open(newLocation.id, {
                    params: newLocation.params,
                })
            );
            expect(result.current.locations).toEqual([newLocation]);

            act(() => result.current.close());
            expect(result.current.locations).toEqual([]);
        });

        it('overwrites the previous dialog by default', () => {
            const location1 = {
                id: 'dialog-id-1',
                params: { customDialogParams: 'value 1' },
            };
            const location2 = {
                id: 'dialog-id-2',
                params: { customDialogParams: 'value 2' },
            };
            const { result } = renderHook(() => useDialogContext(), {
                wrapper: createTestComponent,
            });

            act(() => result.current.open(location1.id, { params: location1.params }));
            act(() => result.current.open(location2.id, { params: location2.params }));
            expect(result.current.locations).toEqual([location2]);
        });

        it('supports stacked dialogs (parent-child)', () => {
            const location1 = {
                id: 'parent-dialog-id',
                params: { customDialogParams: 'value 1' },
            };
            const location2 = {
                id: 'child-dialog-id',
                params: { customDialogParams: 'value 2' },
            };
            const { result } = renderHook(() => useDialogContext(), {
                wrapper: createTestComponent,
            });

            act(() => result.current.open(location1.id, { params: location1.params }));
            act(() =>
                result.current.open(location2.id, {
                    params: location2.params,
                    stack: true,
                })
            );
            expect(result.current.locations).toEqual([location1, location2]);
        });

        it('closes all dialogs by default', () => {
            const location1 = {
                id: 'parent-dialog-id',
                params: { customDialogParams: 'value 1' },
            };
            const location2 = {
                id: 'child-dialog-id',
                params: { customDialogParams: 'value 2' },
            };
            const { result } = renderHook(() => useDialogContext(), {
                wrapper: createTestComponent,
            });

            act(() => result.current.open(location1.id, { params: location1.params }));
            act(() =>
                result.current.open(location2.id, {
                    params: location2.params,
                    stack: true,
                })
            );
            act(() => result.current.close());

            expect(result.current.locations).toEqual([]);
        });

        it('closes only selected dialog if provided with ID', () => {
            const location1 = {
                id: 'parent-dialog-id',
                params: { customDialogParams: 'value 1' },
            };
            const location2 = {
                id: 'child-dialog-id',
                params: { customDialogParams: 'value 2' },
            };
            const { result } = renderHook(() => useDialogContext(), {
                wrapper: createTestComponent,
            });

            act(() => result.current.open(location1.id, { params: location1.params }));
            act(() =>
                result.current.open(location2.id, {
                    params: location2.params,
                    stack: true,
                })
            );
            act(() => result.current.close(location2.id));

            expect(result.current.locations).toEqual([location1]);
        });
    });
});
