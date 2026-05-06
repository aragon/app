import { render, screen } from '@testing-library/react';
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...actual, Dialog };
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
    const useSwitchChainSpy = jest.spyOn(wagmi, 'useSwitchChain');
    const useDelegateStatementSpy = jest.spyOn(
        delegateStatementService,
        'useDelegateStatement',
    );
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');

    const setHooks = (overrides?: {
        chainId?: number;
        existingContent?: string | null;
        switchChain?: jest.Mock;
        isSwitchingChain?: boolean;
    }) => {
        const {
            chainId = mainnet.id,
            existingContent = null,
            switchChain = jest.fn(),
            isSwitchingChain = false,
        } = overrides ?? {};
        useConnectionSpy.mockReturnValue({
            address: MEMBER_ADDRESS,
            chainId,
            isConnected: true,
        } as unknown as ReturnType<typeof wagmi.useConnection>);
        useSwitchChainSpy.mockReturnValue({
            switchChain,
            isPending: isSwitchingChain,
        } as unknown as ReturnType<typeof wagmi.useSwitchChain>);
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
        useDialogContextSpy.mockReturnValue(generateDialogContext());
    };

    afterEach(() => {
        useConnectionSpy.mockReset();
        useSwitchChainSpy.mockReset();
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
        expect(
            screen.getByRole('button', {
                name: 'app.governance.delegateStatementDialog.mainnetSwitch.action',
            }),
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

    it('keeps the submit button disabled while the wallet is on a non-mainnet chain', () => {
        setHooks({ chainId: polygon.id });
        createTestComponent();
        const submit = screen.getByRole('button', {
            name: 'app.governance.delegateStatementDialog.submit',
        });
        expect(submit).toHaveAttribute('aria-disabled', 'true');
    });
});
