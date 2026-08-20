import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import * as useWalletAccountHook from '../../../application/hooks/useWalletAccount';
import { workspaceService } from '../../api/workspaceService';
import { generateWorkspace } from '../../testUtils';
import {
    CreateWorkspaceDialog,
    type ICreateWorkspaceDialogProps,
} from './createWorkspaceDialog';

// Dialog.* primitives need a Radix Dialog.Root context which the dialogProvider supplies in
// production, and AddressInput needs a wagmi config to resolve ENS names. In unit tests we render
// the component directly, so both are replaced by minimal stand-ins.
jest.mock('@aragon/gov-ui-kit', () => {
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const AddressInput = (props: {
        value?: string;
        onChange: (value: string) => void;
        onAccept: (value?: { address: string }) => void;
    }) => (
        <input
            onChange={(event) => {
                props.onChange(event.target.value);
                props.onAccept({ address: event.target.value });
            }}
            value={props.value ?? ''}
        />
    );
    const Dialog = {
        Header: (props: { title: string }) => <h2>{props.title}</h2>,
        Content: (props: { children: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Footer: (props: {
            primaryAction: { label: string; onClick?: () => void };
            secondaryAction?: { label: string; onClick?: () => void };
        }) => (
            <>
                <button onClick={props.primaryAction.onClick} type="button">
                    {props.primaryAction.label}
                </button>
                <button onClick={props.secondaryAction?.onClick} type="button">
                    {props.secondaryAction?.label}
                </button>
            </>
        ),
    };

    return { ...actual, AddressInput, Dialog };
});

jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

describe('<CreateWorkspaceDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const createWorkspaceSpy = jest.spyOn(workspaceService, 'createWorkspace');

    const creator = '0x5F1680d0c2c5E9d3615a036FbDc7432E7bf246FB';
    const target = '0x974E865B1BB24AF2a9ef8204AdEA9251Cc7C5FD9';

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useWalletAccountSpy.mockReturnValue({
            address: creator,
            chainId: 1,
            isConnecting: false,
            isReconnecting: false,
        });
        createWorkspaceSpy.mockResolvedValue(generateWorkspace());
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useWalletAccountSpy.mockReset();
        createWorkspaceSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ICreateWorkspaceDialogProps>,
    ) => {
        const completeProps: ICreateWorkspaceDialogProps = {
            location: { id: 'create-workspace' },
            ...props,
        };

        return (
            <ReactQueryWrapper>
                <CreateWorkspaceDialog {...completeProps} />
            </ReactQueryWrapper>
        );
    };

    it('renders the name, network and target fields', () => {
        render(createTestComponent());

        expect(
            screen.getByText(/createWorkspaceDialog.title/),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/createWorkspaceDialog.targets.add/),
        ).toBeInTheDocument();
    });

    it('does not create the workspace when the form is incomplete', async () => {
        render(createTestComponent());

        await userEvent.click(
            screen.getByRole('button', {
                name: /createWorkspaceDialog.action.submit/,
            }),
        );

        expect(createWorkspaceSpy).not.toHaveBeenCalled();
    });

    it('creates the workspace with the connected wallet as creator', async () => {
        render(createTestComponent());

        const inputs = screen.getAllByRole('textbox');
        await userEvent.type(inputs[0], 'test-workspace');
        await userEvent.type(inputs[1], target);
        await userEvent.click(
            screen.getByRole('button', {
                name: /createWorkspaceDialog.action.submit/,
            }),
        );

        expect(createWorkspaceSpy).toHaveBeenCalledWith({
            body: {
                creator,
                name: 'test-workspace',
                network: 'ethereum-mainnet',
                targets: [target],
            },
        });
    });
});
