import { render, screen } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import * as dialogProvider from '@/shared/components/dialogProvider';
import { generateDialogContext, ReactQueryWrapper } from '@/shared/testUtils';
import * as memberProfileService from '../../api/memberProfileService';
import * as useEnsSubdomainFieldHook from '../../hooks/useEnsSubdomainField';
import * as useWalletAccountHook from '../../hooks/useWalletAccount';
import {
    AragonProfileRenameDialog,
    type IAragonProfileRenameDialogProps,
} from './aragonProfileRenameDialog';

// Dialog.* primitives need a Radix Dialog.Root context which the dialogProvider
// supplies in production. In unit tests we render the component directly, so
// mock the Dialog namespace to side-step that context error.
jest.mock('@aragon/gov-ui-kit', () => {
    const actual = jest.requireActual('@aragon/gov-ui-kit');
    const Dialog = {
        Header: (props: { title: string }) => <h2>{props.title}</h2>,
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
            <button
                disabled={props.primaryAction.disabled}
                onClick={props.primaryAction.onClick}
                type="button"
            >
                {props.primaryAction.label}
            </button>
        ),
    };
    return { ...actual, Dialog };
});

const ADDR = '0x2222222222222222222222222222222222222222';

type TextRecordsResult = ReturnType<
    typeof memberProfileService.useMemberProfileTextRecords
>;
type ResolverRecordsResult = ReturnType<typeof ensModule.useEnsResolverRecords>;

describe('<AragonProfileRenameDialog />', () => {
    const useDialogContextSpy = jest.spyOn(dialogProvider, 'useDialogContext');
    const useWalletAccountSpy = jest.spyOn(
        useWalletAccountHook,
        'useWalletAccount',
    );
    const useTextRecordsSpy = jest.spyOn(
        memberProfileService,
        'useMemberProfileTextRecords',
    );
    const useResolverRecordsSpy = jest.spyOn(
        ensModule,
        'useEnsResolverRecords',
    );
    const useEnsSubdomainFieldSpy = jest.spyOn(
        useEnsSubdomainFieldHook,
        'useEnsSubdomainField',
    );

    const mockTextRecords = (overrides: Partial<TextRecordsResult>) =>
        useTextRecordsSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            ...overrides,
        } as TextRecordsResult);

    const mockResolverRecords = (overrides: Partial<ResolverRecordsResult>) =>
        useResolverRecordsSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
            ...overrides,
        } as ResolverRecordsResult);

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue(generateDialogContext());
        useWalletAccountSpy.mockReturnValue({
            address: '0x1111111111111111111111111111111111111111',
            chainId: 1,
            isReconnecting: false,
        });
        useEnsSubdomainFieldSpy.mockReturnValue({
            fieldProps: {
                name: 'subdomain',
                value: '',
                onChange: jest.fn(),
                onBlur: jest.fn(),
            },
            isCheckingAvailability: false,
            isNameTaken: false,
        } as unknown as ReturnType<
            typeof useEnsSubdomainFieldHook.useEnsSubdomainField
        >);
        mockTextRecords({});
        mockResolverRecords({});
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const createTestComponent = (
        props?: Partial<IAragonProfileRenameDialogProps>,
    ) =>
        render(
            <ReactQueryWrapper>
                <AragonProfileRenameDialog
                    location={{
                        id: 'rename',
                        params: { currentEnsName: 'alice.aragon.eth' },
                    }}
                    {...props}
                />
            </ReactQueryWrapper>,
        );

    const submitButton = () =>
        screen.getByRole('button', {
            name: /aragonProfileRenameDialog.actions.submit/,
        });

    it('keeps submit disabled while records are loading', () => {
        mockTextRecords({ isLoading: true });
        mockResolverRecords({ isLoading: true });
        createTestComponent();

        expect(submitButton()).toBeDisabled();
    });

    it('keeps submit disabled and surfaces an error when records fail to load', () => {
        mockTextRecords({ isError: true });
        mockResolverRecords({ isError: true });
        createTestComponent();

        expect(submitButton()).toBeDisabled();
        expect(
            screen.getByText(
                'app.application.aragonProfileRenameDialog.recordsFetchError',
            ),
        ).toBeInTheDocument();
    });

    it('keeps submit disabled and shows a not-found message when the name has no resolver', () => {
        mockTextRecords({ data: [] });
        mockResolverRecords({ data: null });
        createTestComponent();

        expect(submitButton()).toBeDisabled();
        expect(
            screen.getByText(
                'app.application.aragonProfileRenameDialog.profileNotFound',
            ),
        ).toBeInTheDocument();
    });

    it('enables submit once the current profile records are loaded', () => {
        mockTextRecords({ data: [{ key: 'url', value: 'https://alice.xyz' }] });
        mockResolverRecords({
            data: { addr: ADDR, contenthash: '0x' },
        });
        createTestComponent();

        expect(submitButton()).toBeEnabled();
    });
});
