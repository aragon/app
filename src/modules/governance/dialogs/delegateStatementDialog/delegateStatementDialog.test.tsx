import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mainnet, polygon } from 'viem/chains';
import * as wagmi from 'wagmi';
import { Network } from '@/shared/api/daoService';
import * as delegateStatementService from '@/shared/api/delegateStatementService';
import * as dialogProvider from '@/shared/components/dialogProvider';
import {
    generateDialogContext,
    generateReactQueryResultSuccessWithData,
} from '@/shared/testUtils';
import { DelegateStatementDialog } from './delegateStatementDialog';
import type { IDelegateStatementDialogParams } from './delegateStatementDialog.api';

// Dialog.* primitives need a Radix Dialog.Root context which the dialogProvider
// supplies in production. In unit tests we render the component directly, so
// mock the Dialog namespace to side-step that context error. Mirrors the pattern
// in simulateActionsDialog.test.tsx.
jest.mock('@aragon/gov-ui-kit', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: { title: string; onClose?: () => void }) => (
            <div>
                <h2>{props.title}</h2>
                <button onClick={props.onClose} type="button">
                    close
                </button>
            </div>
        ),
        Content: (props: { children: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Footer: (props: {
            primaryAction: {
                label: string;
                disabled?: boolean;
                onClick?: () => void;
            };
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
                <button
                    aria-disabled={props.primaryAction.disabled}
                    onClick={props.primaryAction.onClick}
                    type="button"
                >
                    {props.primaryAction.label}
                </button>
            </div>
        ),
    };
    const TextAreaRichText = (
        props: React.ComponentProps<'textarea'> & {
            helpText?: string;
            immediatelyRender?: boolean;
            valueFormat?: string;
        },
    ) => {
        const {
            helpText,
            immediatelyRender: _immediatelyRender,
            valueFormat: _valueFormat,
            ...textareaProps
        } = props;

        return (
            <div>
                {helpText != null && <span>{helpText}</span>}
                <textarea {...textareaProps} />
            </div>
        );
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, Dialog, TextAreaRichText };
});

const TOKEN_ADDRESS = '0x1111111111111111111111111111111111111111';
const MEMBER_ADDRESS = '0x2222222222222222222222222222222222222222';
const DAO_ID = 'dao-test';
const CID = 'bafyTest';

const buildParams = (
    overrides?: Partial<IDelegateStatementDialogParams>,
): IDelegateStatementDialogParams => ({
    tokenAddress: TOKEN_ADDRESS,
    memberAddress: MEMBER_ADDRESS,
    daoId: DAO_ID,
    ensName: 'whomst.eth',
    network: Network.ETHEREUM_MAINNET,
    existingCid: null,
    ...overrides,
});

describe('<DelegateStatementDialog />', () => {
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useDelegateStatementSpy = jest.spyOn(
        delegateStatementService,
        'useDelegateStatement',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const setHooks = (overrides?: {
        chainId?: number;
        existingContent?: string | null;
        dialogContext?: ReturnType<typeof generateDialogContext>;
    }) => {
        const {
            chainId = mainnet.id,
            existingContent = null,
            dialogContext = generateDialogContext(),
        } = overrides ?? {};
        useConnectionSpy.mockReturnValue({
            address: MEMBER_ADDRESS,
            chainId,
            isConnected: true,
        } as unknown as ReturnType<typeof wagmi.useConnection>);
        useDelegateStatementSpy.mockReturnValue(
            generateReactQueryResultSuccessWithData(
                existingContent != null
                    ? {
                          version: 1,
                          type: 'statement',
                          format: 'markdown',
                          content: existingContent,
                      }
                    : null,
            ) as unknown as ReturnType<
                typeof delegateStatementService.useDelegateStatement
            >,
        );
        useDialogContextSpy.mockReturnValue(dialogContext);
    };

    afterEach(() => {
        useConnectionSpy.mockReset();
        useDelegateStatementSpy.mockReset();
        useDialogContextSpy.mockReset();
    });

    const createTestComponent = (
        overrides?: Partial<IDelegateStatementDialogParams>,
    ) =>
        render(
            <DelegateStatementDialog
                location={{
                    id: 'DELEGATE_STATEMENT_FORM',
                    params: buildParams(overrides),
                }}
            />,
        );

    it('renders a rich-text content field', () => {
        setHooks();
        createTestComponent();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('disables the submit button when the form is empty (create mode, on mainnet)', () => {
        setHooks();
        createTestComponent();
        const submit = screen.getByRole('button', {
            name: 'app.governance.delegateStatementDialog.submit',
        });
        expect(submit).toHaveAttribute('aria-disabled', 'true');
    });

    it('disables the submit button when the pre-loaded content is unaltered (edit mode, on mainnet)', () => {
        setHooks({ existingContent: 'Existing statement.' });
        createTestComponent({ existingCid: CID });
        const submit = screen.getByRole('button', {
            name: 'app.governance.delegateStatementDialog.submit',
        });
        expect(submit).toHaveAttribute('aria-disabled', 'true');
    });

    it('shows a mainnet-switch prompt when the wallet is on a non-mainnet chain', () => {
        setHooks({ chainId: polygon.id });
        createTestComponent();
        expect(
            screen.getByText(
                'app.governance.delegateStatementDialog.mainnetSwitch.message',
            ),
        ).toBeInTheDocument();
    });

    it('hides the mainnet-switch prompt when the wallet is already on mainnet', () => {
        setHooks({ chainId: mainnet.id });
        createTestComponent();
        expect(
            screen.queryByText(
                'app.governance.delegateStatementDialog.mainnetSwitch.message',
            ),
        ).not.toBeInTheDocument();
    });

    it('opens the transaction dialog from a non-mainnet wallet once the content changes', async () => {
        const dialogContext = generateDialogContext();
        setHooks({ chainId: polygon.id, dialogContext });
        createTestComponent();

        await userEvent.type(screen.getByRole('textbox'), 'New statement');

        const submit = screen.getByRole('button', {
            name: 'app.governance.delegateStatementDialog.submit',
        });

        expect(submit).not.toHaveAttribute('aria-disabled', 'true');

        await userEvent.click(submit);

        expect(dialogContext.open).toHaveBeenCalledWith(
            'DELEGATE_STATEMENT_TRANSACTION',
            {
                params: {
                    ensName: 'whomst.eth',
                    network: Network.ETHEREUM_MAINNET,
                    tokenAddress: TOKEN_ADDRESS,
                    content: 'New statement',
                },
            },
        );
        expect(dialogContext.close).not.toHaveBeenCalled();
    });
});
