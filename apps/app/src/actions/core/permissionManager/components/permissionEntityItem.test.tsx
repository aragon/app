import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import {
    type IPermissionEntityItemProps,
    PermissionEntityItem,
} from './permissionEntityItem';

describe('<PermissionEntityItem /> component', () => {
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');

    beforeEach(() => {
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
    });

    afterEach(() => {
        useEnsNameSpy.mockReset();
    });

    const address = '0xC8da4C1d9BB59DD32ac39A925933188b7c66c311';

    const createTestComponent = (
        props?: Partial<IPermissionEntityItemProps>,
    ) => {
        const completeProps: IPermissionEntityItemProps = {
            term: 'Who',
            address,
            ...props,
        };

        return (
            <DefinitionList.Container>
                <PermissionEntityItem {...completeProps} />
            </DefinitionList.Container>
        );
    };

    it('renders the term and the address as the value', () => {
        render(createTestComponent());

        expect(screen.getByText('Who')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
    });

    it('shows a resolved name as supporting detail, never in place of the address', () => {
        render(createTestComponent({ label: 'Token Voting' }));

        expect(screen.getByText('Token Voting')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
    });

    it('omits the detail when the label is only the address again', () => {
        render(
            createTestComponent({
                label: addressUtils.truncateAddress(address),
            }),
        );

        expect(
            screen.getAllByText(addressUtils.truncateAddress(address)),
        ).toHaveLength(1);
    });

    it('links to the explorer when a url is given', () => {
        render(createTestComponent({ href: 'https://explorer.test/address' }));

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://explorer.test/address',
        );
    });
    it('shows the ENS name when nothing more specific resolves', () => {
        useEnsNameSpy.mockReturnValue({
            data: 'vitalik.eth',
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        render(createTestComponent());

        expect(screen.getByText('vitalik.eth')).toBeInTheDocument();
    });

    it('prefers a DAO or plugin name over the ENS name', () => {
        useEnsNameSpy.mockReturnValue({
            data: 'vitalik.eth',
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        render(createTestComponent({ label: 'Token Voting' }));

        expect(screen.getByText('Token Voting')).toBeInTheDocument();
        expect(screen.queryByText('vitalik.eth')).not.toBeInTheDocument();
    });
});
