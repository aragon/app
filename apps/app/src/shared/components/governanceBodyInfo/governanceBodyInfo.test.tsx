import {
    AddressResolutionProvider,
    addressEntryKey,
    addressUtils,
} from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    GovernanceBodyInfo,
    type IGovernanceBodyInfoProps,
} from './governanceBodyInfo';

describe('<GovernanceBodyInfo /> component', () => {
    const createTestComponent = (props?: Partial<IGovernanceBodyInfoProps>) => {
        const completeProps: IGovernanceBodyInfoProps = {
            ...props,
        };

        return <GovernanceBodyInfo {...completeProps} />;
    };

    it('throws error if neither address nor subdomain is provided', () => {
        expect(() => render(createTestComponent())).toThrow();
    });

    it('renders the subdomain (parsed) and version when provided', () => {
        const subdomain = 'token-voting';
        const release = '2';
        const build = '4';
        render(createTestComponent({ subdomain, release, build }));

        expect(screen.getByText('Token Voting v2.4')).toBeInTheDocument();
    });

    it('renders the name, address and external subtitle when both are defined', () => {
        const name = 'test.eth';
        const address = '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8';
        render(createTestComponent({ name, address }));

        expect(screen.getByText(name)).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/governanceBodyInfo.external/),
        ).toBeInTheDocument();
    });

    describe('with the address book', () => {
        const address = '0xB017BB3D282a542Ef521F9052Eba61F1e79FC6E8';
        const entries = new Map([
            [
                addressEntryKey(address, 0),
                { label: 'Ops wallet', source: 'workspace' as const },
            ],
        ]);

        const renderWithBook = (props: Partial<IGovernanceBodyInfoProps>) =>
            render(
                <AddressResolutionProvider entries={entries}>
                    {createTestComponent({ address, ...props })}
                </AddressResolutionProvider>,
            );

        // The short address beside a name stays plain: resolving it would show a second name.
        it('shows a named body by its name and its plain short address', () => {
            renderWithBook({ name: 'Founders' });

            expect(screen.getByText('Founders')).toBeInTheDocument();
            expect(
                screen.getByText(addressUtils.truncateAddress(address)),
            ).toBeInTheDocument();
            expect(screen.queryByText('Ops wallet')).not.toBeInTheDocument();
        });

        it('names an unnamed body from the address book', () => {
            renderWithBook({});

            expect(screen.getByText('Ops wallet')).toBeInTheDocument();
        });
    });
});
