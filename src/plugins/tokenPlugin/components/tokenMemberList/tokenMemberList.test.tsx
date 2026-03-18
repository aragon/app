import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as wagmi from 'wagmi';
import * as governanceService from '@/modules/governance/api/governanceService';
import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import * as daoService from '@/shared/api/daoService';
import { Network } from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as useTokenCurrentDelegateModule from '../../hooks/useTokenCurrentDelegate';
import {
    generateTokenMember,
    generateTokenPluginSettings,
} from '../../testUtils';
import type { ITokenMember } from '../../types';
import { type ITokenMemberListProps, TokenMemberList } from './tokenMemberList';

jest.mock('./components/tokenMemberListItem', () => ({
    TokenMemberListItem: (props: {
        member: ITokenMember;
        isDelegate?: boolean;
    }) => (
        <div data-is-delegate={props.isDelegate} data-testid="member-mock">
            {props.member.address}
        </div>
    ),
}));

describe('<TokenMemberList /> component', () => {
    const useMemberListDataSpy = jest.spyOn(
        useMemberListData,
        'useMemberListData',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useTokenCurrentDelegateSpy = jest.spyOn(
        useTokenCurrentDelegateModule,
        'useTokenCurrentDelegate',
    );
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');

    const defaultDao = generateDao({ network: Network.ETHEREUM_SEPOLIA });

    beforeEach(() => {
        useMemberListDataSpy.mockReturnValue({
            memberList: undefined,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        useDaoSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: defaultDao }),
        );
        useConnectionSpy.mockReturnValue({
            address: undefined,
        } as unknown as wagmi.UseConnectionReturnType);
        useTokenCurrentDelegateSpy.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        });
        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            }),
        );
    });

    afterEach(() => {
        useMemberListDataSpy.mockReset();
        useDaoSpy.mockReset();
        useConnectionSpy.mockReset();
        useTokenCurrentDelegateSpy.mockReset();
        useMemberSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<ITokenMemberListProps>) => {
        const completeProps: ITokenMemberListProps = {
            initialParams: {
                queryParams: { daoId: 'dao-id', pluginAddress: '0x123' },
            },
            plugin: generateDaoPlugin({
                settings: generateTokenPluginSettings(),
            }),
            ...props,
        };

        return (
            <GukModulesProvider>
                <TokenMemberList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the token member list', () => {
        const members = [
            generateTokenMember({ address: '0x123' }),
            generateTokenMember({ address: '0x456' }),
        ];
        useMemberListDataSpy.mockReturnValue({
            memberList: members,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: members.length,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent());
        expect(screen.getAllByTestId('member-mock')).toHaveLength(2);
        expect(screen.getByText(members[0].address)).toBeInTheDocument();
        expect(screen.getByText(members[1].address)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        const hidePagination = true;
        useMemberListDataSpy.mockReturnValue({
            memberList: [generateTokenMember()],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent({ hidePagination }));
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('pins the connected user to the top when they have voting power', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const otherMember = generateTokenMember({
            address: '0x9999999999999999999999999999999999999999',
            votingPower: '5000',
        });
        const userMember = generateTokenMember({
            address: userAddress,
            votingPower: '100',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useMemberListDataSpy.mockReturnValue({
            memberList: [otherMember],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockImplementation((params) => {
            if (params.urlParams.address === userAddress) {
                return generateReactQueryResultSuccess({ data: userMember });
            }
            return generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            });
        });

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(2);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(
            '0x9999999999999999999999999999999999999999',
        );
    });

    it('pins the delegate to the top when user has a valid delegate', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const delegateAddr = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
        const otherMember = generateTokenMember({
            address: '0x9999999999999999999999999999999999999999',
            votingPower: '5000',
        });
        const userMember = generateTokenMember({
            address: userAddress,
            votingPower: '100',
        });
        const delegateMember = generateTokenMember({
            address: delegateAddr,
            votingPower: '200',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useTokenCurrentDelegateSpy.mockReturnValue({
            data: delegateAddr as `0x${string}`,
            isLoading: false,
            isError: false,
        });

        useMemberListDataSpy.mockReturnValue({
            memberList: [otherMember],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 3,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockImplementation((params) => {
            if (params.urlParams.address === userAddress) {
                return generateReactQueryResultSuccess({ data: userMember });
            }
            if (params.urlParams.address === delegateAddr) {
                return generateReactQueryResultSuccess({
                    data: delegateMember,
                });
            }
            return generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            });
        });

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(3);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(delegateAddr);
        expect(memberElements[1].getAttribute('data-is-delegate')).toBe('true');
        expect(memberElements[2].textContent).toBe(
            '0x9999999999999999999999999999999999999999',
        );
    });

    it('does not pin user when voting power is zero (e.g. delegated away)', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const otherMember = generateTokenMember({
            address: '0x9999999999999999999999999999999999999999',
            votingPower: '5000',
        });
        const userMember = generateTokenMember({
            address: userAddress,
            votingPower: '0',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useMemberListDataSpy.mockReturnValue({
            memberList: [otherMember],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 1,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockImplementation((params) => {
            if (params.urlParams.address === userAddress) {
                return generateReactQueryResultSuccess({ data: userMember });
            }
            return generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            });
        });

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(1);
        expect(memberElements[0].textContent).toBe(
            '0x9999999999999999999999999999999999999999',
        );
    });

    it('does not treat self-delegation as a valid delegate', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const userMember = generateTokenMember({
            address: userAddress,
            votingPower: '100',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useTokenCurrentDelegateSpy.mockReturnValue({
            data: userAddress as `0x${string}`,
            isLoading: false,
            isError: false,
        });

        useMemberListDataSpy.mockReturnValue({
            memberList: [
                generateTokenMember({
                    address: '0x9999999999999999999999999999999999999999',
                    votingPower: '5000',
                }),
            ],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockImplementation((params) => {
            if (params.urlParams.address === userAddress) {
                return generateReactQueryResultSuccess({ data: userMember });
            }
            return generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            });
        });

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements[0].getAttribute('data-is-delegate')).toBe(
            'false',
        );
    });

    it('does not treat zero address delegate as a valid delegate', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useTokenCurrentDelegateSpy.mockReturnValue({
            data: '0x0000000000000000000000000000000000000000' as `0x${string}`,
            isLoading: false,
            isError: false,
        });

        useMemberListDataSpy.mockReturnValue({
            memberList: [
                generateTokenMember({
                    address: '0x9999999999999999999999999999999999999999',
                    votingPower: '5000',
                }),
            ],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 1,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            }),
        );

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(1);
        expect(memberElements[0].getAttribute('data-is-delegate')).toBe(
            'false',
        );
    });

    it('deduplicates pinned members from the paginated list', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const userMember = generateTokenMember({
            address: userAddress,
            votingPower: '100',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useMemberListDataSpy.mockReturnValue({
            memberList: [
                userMember,
                generateTokenMember({
                    address: '0x9999999999999999999999999999999999999999',
                }),
            ],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockImplementation((params) => {
            if (params.urlParams.address === userAddress) {
                return generateReactQueryResultSuccess({ data: userMember });
            }
            return generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            });
        });

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(2);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(
            '0x9999999999999999999999999999999999999999',
        );
    });
});
