import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import {
    type ISafeQueueSlotDialogProps,
    SafeQueueSlotDialog,
} from './safeQueueSlotDialog';

// The radix dialog primitives need a dialog root above them, which the provider supplies at
// runtime; the disclosure copy and the two actions are what this dialog is being tested for.
jest.mock('@aragon/gov-ui-kit', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: { title: string }) => <h2>{props.title}</h2>,
        Content: (props: { children?: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Footer: (props: {
            primaryAction: { label: string; onClick?: () => void };
            secondaryAction?: { label: string; onClick?: () => void };
        }) => (
            <div>
                {props.secondaryAction != null && (
                    <button
                        onClick={props.secondaryAction.onClick}
                        type="button"
                    >
                        {props.secondaryAction.label}
                    </button>
                )}
                <button onClick={props.primaryAction.onClick} type="button">
                    {props.primaryAction.label}
                </button>
            </div>
        ),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, Dialog };
});

describe('<SafeQueueSlotDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const close = jest.fn();

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext({ close }));
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        close.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ISafeQueueSlotDialogProps>,
        params?: Partial<ISafeQueueSlotDialogProps['location']['params']>,
    ) => {
        const completeProps = {
            location: {
                id: 'SAFE_QUEUE_SLOT',
                params: {
                    mode: 'remove' as const,
                    onConfirm: jest.fn(),
                    ...params,
                },
            },
            ...props,
        } as ISafeQueueSlotDialogProps;

        return (
            <GukModulesProvider>
                <SafeQueueSlotDialog {...completeProps} />
            </GukModulesProvider>
        );
    };

    it.each([{ mode: 'remove' as const }, { mode: 'replace' as const }])(
        'states what the $mode route costs before it is taken',
        async ({ mode }) => {
            // The two routes differ in cost, authority and visibility, so each states its own
            // consequences: one shared "cancel" sentence would be wrong for whichever the owner
            // had in mind.
            const onConfirm = jest.fn();
            render(createTestComponent(undefined, { mode, onConfirm }));

            expect(
                screen.getByText(`app.safe.safeQueueSlotDialog.${mode}.body`),
            ).toBeInTheDocument();

            await userEvent.click(
                screen.getByRole('button', {
                    name: `app.safe.safeQueueSlotDialog.${mode}.confirm`,
                }),
            );

            expect(onConfirm).toHaveBeenCalledTimes(1);
        },
    );

    it('acts on nothing when the owner backs out', async () => {
        const onConfirm = jest.fn();
        render(createTestComponent(undefined, { onConfirm }));

        await userEvent.click(
            screen.getByRole('button', {
                name: 'app.safe.safeQueueSlotDialog.dismiss',
            }),
        );

        expect(onConfirm).not.toHaveBeenCalled();
        expect(close).toHaveBeenCalledWith('SAFE_QUEUE_SLOT');
    });
});
