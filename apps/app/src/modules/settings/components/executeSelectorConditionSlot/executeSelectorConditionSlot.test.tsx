import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import {
    type IAllowedAction,
    useAllowedActions,
} from '@/modules/governance/api/executeSelectorsService';
import { type IDaoPermissionCondition, Network } from '@/shared/api/daoService';
import { ExecuteSelectorConditionSlot } from './executeSelectorConditionSlot';

jest.mock('@/modules/governance/api/executeSelectorsService', () => ({
    ...jest.requireActual('@/modules/governance/api/executeSelectorsService'),
    useAllowedActions: jest.fn(),
}));

describe('<ExecuteSelectorConditionSlot /> component', () => {
    const useAllowedActionsMock = jest.mocked(useAllowedActions);
    type ExecuteSelectorConditionProps = IDaoPermissionCondition & {
        chainId?: number;
        conditionAddress?: string;
        network?: Network;
        pluginAddress?: string;
    };

    const createTestComponent = (
        props?: Partial<ExecuteSelectorConditionProps>,
    ) => {
        const completeProps: ExecuteSelectorConditionProps = {
            conditionType: 'execute-selector',
            ...props,
        };

        return (
            <GukModulesProvider>
                <ExecuteSelectorConditionSlot {...completeProps} />
            </GukModulesProvider>
        );
    };

    beforeEach(() => {
        useAllowedActionsMock.mockReset();
    });

    const mockAllowedActions = (
        data: Array<
            Partial<IAllowedAction> & {
                conditionAddress: string;
                decoded: IAllowedAction['decoded'];
                id: string;
                selector: string;
                target: string;
            }
        >,
    ) => {
        useAllowedActionsMock.mockReturnValue({
            data: {
                pages: [
                    {
                        data,
                        metadata: { totalRecords: data.length },
                    },
                ],
                pageParams: [],
            },
            isLoading: false,
        } as unknown as ReturnType<typeof useAllowedActions>);
    };

    it('renders the description and the selectors mapped to their truncated targets', () => {
        render(
            createTestComponent({
                selectors: ['0xa9059cbb', '0x23b872dd'],
                targets: [
                    '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5',
                    '0xDe0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
                ],
            }),
        );

        expect(
            screen.getByText(/executeSelectorConditionSlot.description/),
        ).toBeInTheDocument();
        expect(screen.getAllByText('0xa9059cbb')).toHaveLength(2);
        expect(screen.getByText('0x0bA4…a2e5')).toBeInTheDocument();
        expect(screen.getAllByText('0x23b872dd')).toHaveLength(2);
        expect(screen.getByText('0xDe0B…7BAe')).toBeInTheDocument();
    });

    it('renders decoded actions resolved from the backend for matching selectors and condition', () => {
        const conditionAddress = '0xC0Ffee254729296a45a3885639AC7E10F9d54979';
        const matchingTarget = '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5';
        const unrelatedTarget = '0xDe0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';

        mockAllowedActions([
            {
                conditionAddress,
                decoded: {
                    contractName: 'AddressGaugeVoter',
                    functionName: 'pause',
                    inputs: [],
                },
                id: 'decoded-pause',
                selector: '0x8456cb59',
                target: matchingTarget,
            },
            {
                conditionAddress: '0xdEAD000000000000000042069420694206942069',
                decoded: {
                    contractName: 'AddressGaugeVoter',
                    functionName: 'unrelated',
                    inputs: [],
                },
                id: 'decoded-unrelated',
                selector: '0x8456cb59',
                target: unrelatedTarget,
            },
        ]);

        render(
            createTestComponent({
                chainId: 42_161,
                conditionAddress,
                network: Network.ARBITRUM_MAINNET,
                pluginAddress: '0x1234567890123456789012345678901234567890',
                selectors: ['0x8456cb59'],
                targets: [matchingTarget],
            }),
        );

        expect(useAllowedActionsMock).toHaveBeenCalledWith({
            queryParams: { pageSize: 50 },
            urlParams: {
                network: Network.ARBITRUM_MAINNET,
                pluginAddress: '0x1234567890123456789012345678901234567890',
            },
        });
        expect(screen.getByText('pause')).toBeInTheDocument();
        expect(screen.getByText('0x8456cb59')).toBeInTheDocument();
        expect(screen.getByText('AddressGaugeVoter')).toBeInTheDocument();
        expect(screen.getByText('0x0bA4…a2e5')).toBeInTheDocument();
        expect(screen.queryByText('unrelated')).not.toBeInTheDocument();
        expect(screen.queryByText('0xDe0B…7BAe')).not.toBeInTheDocument();
    });

    it('falls back to raw actions when the backend has no decoded match', () => {
        const target = '0x0bA45A8b5d5575935B8158a88C631E9F9C95a2e5';

        mockAllowedActions([]);

        render(
            createTestComponent({
                conditionAddress: '0xC0Ffee254729296a45a3885639AC7E10F9d54979',
                network: Network.ARBITRUM_MAINNET,
                pluginAddress: '0x1234567890123456789012345678901234567890',
                selectors: ['0xaaaaaaaa'],
                targets: [target],
            }),
        );

        expect(useAllowedActionsMock).toHaveBeenCalled();
        expect(screen.getAllByText('0xaaaaaaaa')).toHaveLength(2);
        expect(screen.getByText('0x0bA4…a2e5')).toBeInTheDocument();
        expect(screen.queryByText('AddressGaugeVoter')).not.toBeInTheDocument();
    });

    it('shows the no allowed actions fallback when selectors are absent', () => {
        render(createTestComponent({ selectors: undefined }));

        expect(
            screen.getByText(/executeSelectorConditionSlot.noActions/),
        ).toBeInTheDocument();
    });

    it('ignores non-string selector entries when narrowing the payload', () => {
        render(
            createTestComponent({ selectors: ['0xaaaaaaaa', 42, null, ''] }),
        );

        expect(screen.getAllByText('0xaaaaaaaa')).toHaveLength(2);
        expect(screen.queryByText('42')).not.toBeInTheDocument();
        expect(
            screen.queryByText(/executeSelectorConditionSlot.noActions/),
        ).not.toBeInTheDocument();
    });

    it('renders a placeholder target when no matching target is provided', () => {
        render(createTestComponent({ selectors: ['0xaaaaaaaa'], targets: [] }));

        expect(screen.getAllByText('0xaaaaaaaa')).toHaveLength(2);
        expect(screen.getByText('—')).toBeInTheDocument();
    });
});
