import * as useDialogContext from '@/shared/components/dialogProvider';
import { render } from '@testing-library/react';
import * as wagmi from 'wagmi';
import { type IUserDialogProps, UserDialog } from './userDialog';

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    MemberAvatar: () => <div data-testid="member-avatar-mock" />,
}));

describe('<UserDialog /> component', () => {
    const useDialogContextSpy = jest.spyOn(useDialogContext, 'useDialogContext');
    const useAccountSpy = jest.spyOn(wagmi, 'useAccount');
    const useDisconnectSpy = jest.spyOn(wagmi, 'useDisconnect');
    const useEnsNameSpy = jest.spyOn(wagmi, 'useEnsName');

    beforeEach(() => {
        useDialogContextSpy.mockReturnValue({ open: jest.fn(), close: jest.fn() });
        useAccountSpy.mockReturnValue({} as unknown as wagmi.UseAccountReturnType);
        useDisconnectSpy.mockReturnValue({} as unknown as wagmi.UseDisconnectReturnType);
        useEnsNameSpy.mockReturnValue({} as unknown as wagmi.UseEnsNameReturnType);
    });

    afterEach(() => {
        useDialogContextSpy.mockReset();
        useAccountSpy.mockReset();
        useDisconnectSpy.mockReset();
        useEnsNameSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<IUserDialogProps>) => {
        const completeProps: IUserDialogProps = {
            location: { id: 'test' },
            ...props,
        };

        return <UserDialog {...completeProps} />;
    };

    it('renders empty container when address is not defined', () => {
        useAccountSpy.mockReturnValue({ address: undefined } as unknown as wagmi.UseAccountReturnType);
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });
});
