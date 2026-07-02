import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import * as ensModule from '@/modules/ens';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext } from '@/shared/testUtils';
import * as useWalletAccountHook from '../../hooks/useWalletAccount';
import {
    AragonProfileDialog,
    type IAragonProfileDialogProps,
} from './aragonProfileDialog';

// Dialog.* primitives need a Radix Dialog.Root context; mock the namespace so the
// component renders standalone. Heavy form children are stubbed — this test only
// covers the "rename" button visibility.
jest.mock('@aragon/gov-ui-kit', () => {
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: { title: string }) => <h2>{props.title}</h2>,
        Content: (props: { children: React.ReactNode }) => (
            <div>{props.children}</div>
        ),
        Footer: () => null,
    };
    return { ...actual, Dialog };
});

jest.mock('@/shared/components/forms/avatarInput', () => ({
    AvatarInput: () => <div data-testid="avatar-input" />,
}));

jest.mock('./aragonProfileSocialFieldRow', () => ({
    AragonProfileSocialFieldRow: () => <div data-testid="social-row" />,
}));

const WALLET = '0x1111111111111111111111111111111111111111';
const RENAME_LABEL = /aragonProfileDialog.actions.renameAragonName/;

describe('<AragonProfileDialog />', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');
    const useEnsProfileRecordsSpy = jest.spyOn(
        ensModule,
        'useEnsProfileRecords',
    );
    const useParamsSpy = jest.spyOn(NextNavigation, 'useParams');
    const useRouterSpy = jest.spyOn(NextNavigation, 'useRouter');

    const mockEnsName = (name: string | null) =>
        useEnsNameSpy.mockReturnValue({
            data: name,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useWalletAccountSpy.mockReturnValue({
            address: WALLET,
            chainId: 1,
            isReconnecting: false,
        });
        useEnsAvatarSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsAvatar>);
        useEnsProfileRecordsSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsProfileRecords>);
        useParamsSpy.mockReturnValue({});
        useRouterSpy.mockReturnValue({
            push: jest.fn(),
        } as unknown as ReturnType<typeof NextNavigation.useRouter>);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (props?: Partial<IAragonProfileDialogProps>) =>
        render(
            <AragonProfileDialog
                location={{ id: 'profile', params: {} }}
                {...props}
            />,
        );

    it('shows the rename action for an Aragon (.aragon.eth) name', () => {
        mockEnsName('alice.aragon.eth');
        createTestComponent();

        expect(
            screen.getByRole('button', { name: RENAME_LABEL }),
        ).toBeInTheDocument();
    });

    it('hides the rename action for a personal ENS name', () => {
        mockEnsName('alice.eth');
        createTestComponent();

        expect(
            screen.queryByRole('button', { name: RENAME_LABEL }),
        ).not.toBeInTheDocument();
    });
});
