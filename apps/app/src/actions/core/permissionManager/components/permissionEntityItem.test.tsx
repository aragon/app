import { addressUtils, DefinitionList } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as ensModule from '@/modules/ens';
import * as smartContractService from '@/modules/governance/api/smartContractService';
import { generateSmartContractAbi } from '@/modules/governance/testUtils';
import { Network } from '@/shared/api/daoService';
import {
    generateReactQueryResultError,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    type IPermissionEntityItemProps,
    PermissionEntityItem,
} from './permissionEntityItem';

describe('<PermissionEntityItem /> component', () => {
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useSmartContractAbiSpy = jest.spyOn(
        smartContractService,
        'useSmartContractAbi',
    );

    beforeEach(() => {
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        useSmartContractAbiSpy.mockReturnValue(
            generateReactQueryResultError({ error: new Error() }),
        );
    });

    afterEach(() => {
        useEnsNameSpy.mockReset();
        useSmartContractAbiSpy.mockReset();
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

    it('renders the term and the truncated address as the link text', () => {
        render(createTestComponent());

        expect(screen.getByText('Who')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
    });

    it('uses the ENS name as the link text instead of the address', () => {
        useEnsNameSpy.mockReturnValue({
            data: 'vitalik.eth',
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        render(createTestComponent({ label: 'Token Voting' }));

        expect(screen.getByText('vitalik.eth')).toBeInTheDocument();
        expect(screen.getByText('Token Voting')).toBeInTheDocument();
    });

    it('shows a resolved name as help text', () => {
        render(createTestComponent({ label: 'Token Voting' }));

        expect(screen.getByText('Token Voting')).toBeInTheDocument();
        expect(
            screen.getByText(addressUtils.truncateAddress(address)),
        ).toBeInTheDocument();
    });

    it('omits the help text when the label is only the address again', () => {
        render(
            createTestComponent({
                label: addressUtils.truncateAddress(address),
            }),
        );

        expect(
            screen.getAllByText(addressUtils.truncateAddress(address)),
        ).toHaveLength(1);
    });

    it('falls back to the contract name when no name resolves', () => {
        useSmartContractAbiSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: generateSmartContractAbi({ name: 'ExecuteSelector' }),
            }),
        );
        render(createTestComponent({ network: Network.ETHEREUM_MAINNET }));

        expect(screen.getByText('ExecuteSelector')).toBeInTheDocument();
    });

    it('only looks up the contract name when no name resolves and the network is known', () => {
        render(
            createTestComponent({
                label: 'Token Voting',
                network: Network.ETHEREUM_MAINNET,
            }),
        );
        expect(useSmartContractAbiSpy).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({ enabled: false }),
        );

        render(createTestComponent());
        expect(useSmartContractAbiSpy).toHaveBeenLastCalledWith(
            expect.anything(),
            expect.objectContaining({ enabled: false }),
        );
    });

    it('links to the explorer when a url is given', () => {
        render(createTestComponent({ href: 'https://explorer.test/address' }));

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            'https://explorer.test/address',
        );
    });
});
