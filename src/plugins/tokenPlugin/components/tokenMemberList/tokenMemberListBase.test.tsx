import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as wagmi from 'wagmi';
import * as governanceService from '@/modules/governance/api/governanceService';
import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
import * as useTokenCurrentDelegateModule from '../../hooks/useTokenCurrentDelegate';
import {
    generateTokenMember,
    generateTokenPluginSettings,
} from '../../testUtils';
import type { ITokenMember } from '../../types';
import {
    type ITokenMemberListBaseProps,
    TokenMemberListBase,
} from './tokenMemberListBase';

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

describe('<TokenMemberListBase />', () => {
    const useMemberListDataSpy = jest.spyOn(
        useMemberListData,
        'useMemberListData',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const resolvePluginDaoIdSpy = jest.spyOn(daoUtils, 'resolvePluginDaoId');
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useTokenCurrentDelegateSpy = jest.spyOn(
        useTokenCurrentDelegateModule,
        'useTokenCurrentDelegate',
    );
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');

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
            generateReactQueryResultSuccess({ data: generateDao() }),
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
        resolvePluginDaoIdSpy.mockReset();
        useConnectionSpy.mockReset();
        useTokenCurrentDelegateSpy.mockReset();
        useMemberSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ITokenMemberListBaseProps>,
    ) => {
        const completeProps: ITokenMemberListBaseProps = {
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
                <TokenMemberListBase {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('renders the member list', () => {
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
        useMemberListDataSpy.mockReturnValue({
            memberList: [generateTokenMember()],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 0,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });
        render(createTestComponent({ hidePagination: true }));
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    it('renders the children property', () => {
        const children = 'test-children';
        render(createTestComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
    });

    it('renders the onboardingCard when provided', () => {
        const onboardingCard = <div data-testid="onboarding-card" />;
        render(createTestComponent({ onboardingCard }));
        expect(screen.getByTestId('onboarding-card')).toBeInTheDocument();
    });

    it('pins the connected user to the top when they have voting power', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const paginatedMembers = [
            generateTokenMember({
                address: '0x9999999999999999999999999999999999999999',
                votingPower: '5000',
            }),
            generateTokenMember({
                address: '0x8888888888888888888888888888888888888888',
                votingPower: '4000',
            }),
        ];
        const userMember = generateTokenMember({
            address: userAddress,
            votingPower: '100',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useMemberListDataSpy.mockReturnValue({
            memberList: paginatedMembers,
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
            return generateReactQueryResultSuccess({
                data: undefined as unknown as ITokenMember,
            });
        });

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(paginatedMembers.length + 1);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(paginatedMembers[0].address);
        expect(memberElements[2].textContent).toBe(paginatedMembers[1].address);
    });

    it('pins the delegate to the top when user has a valid delegate', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const delegateAddr = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
        const paginatedMembers = [
            generateTokenMember({
                address: '0x9999999999999999999999999999999999999999',
                votingPower: '5000',
            }),
            generateTokenMember({
                address: '0x8888888888888888888888888888888888888888',
                votingPower: '4000',
            }),
        ];
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
            memberList: paginatedMembers,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 4,
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

        render(createTestComponent({ enableDelegation: true }));

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(paginatedMembers.length + 2);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(delegateAddr);
        expect(memberElements[1].getAttribute('data-is-delegate')).toBe('true');
        expect(memberElements[2].textContent).toBe(paginatedMembers[0].address);
        expect(memberElements[3].textContent).toBe(paginatedMembers[1].address);
    });

    it('renders pinned user and delegate alongside the paginated members without dropping any', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const delegateAddr = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
        const paginatedMembers = [
            generateTokenMember({
                address: '0x9999999999999999999999999999999999999999',
                votingPower: '5000',
            }),
            generateTokenMember({
                address: '0x8888888888888888888888888888888888888888',
                votingPower: '4000',
            }),
        ];
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
            memberList: paginatedMembers,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 50,
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

        render(createTestComponent({ enableDelegation: true }));

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(paginatedMembers.length + 2);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(delegateAddr);
        expect(memberElements[2].textContent).toBe(paginatedMembers[0].address);
        expect(memberElements[3].textContent).toBe(paginatedMembers[1].address);
    });

    it('keeps real members visible and bumps the counter when the pinned user is missing from the paginated response', () => {
        // Regression for a backend indexer gap: live `/v2/members/:address`
        // sees the connected user with VP > 0 (they delegated on-chain), but
        // `/v2/members` doesn't include them yet. The pinning must not evict
        // a real member, and the "X of Y" counter must reflect what's rendered.
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const paginatedMembers = [
            generateTokenMember({
                address: '0x9999999999999999999999999999999999999999',
                votingPower: '5000',
            }),
            generateTokenMember({
                address: '0x8888888888888888888888888888888888888888',
                votingPower: '4000',
            }),
        ];
        const userMember = generateTokenMember({
            address: userAddress,
            votingPower: '100',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);

        useMemberListDataSpy.mockReturnValue({
            memberList: paginatedMembers,
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: paginatedMembers.length,
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
        expect(memberElements).toHaveLength(paginatedMembers.length + 1);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements.map((el) => el.textContent)).toEqual(
            expect.arrayContaining([
                userAddress,
                paginatedMembers[0].address,
                paginatedMembers[1].address,
            ]),
        );
    });

    describe('linked-account daoId resolution', () => {
        it('augments params with subdomain routing fields for non-linked-account plugins', () => {
            const initialParams = {
                queryParams: { daoId: 'dao-id', pluginAddress: '0x123' },
            };
            resolvePluginDaoIdSpy.mockReturnValue('dao-id');
            render(createTestComponent({ initialParams }));
            expect(useMemberListDataSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryParams: expect.objectContaining({
                        daoId: 'dao-id',
                        pluginAddress: '0x123',
                        pluginInterfaceType: expect.any(String),
                        tokenAddress: expect.any(String),
                    }),
                }),
            );
        });

        it('passes the resolved daoId to useMemberListData for linked-account plugins', () => {
            const resolvedDaoId = 'eth-mainnet-0xlinked';
            resolvePluginDaoIdSpy.mockReturnValue(resolvedDaoId);
            render(createTestComponent());
            expect(useMemberListDataSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    queryParams: expect.objectContaining({
                        daoId: resolvedDaoId,
                    }),
                }),
            );
        });
    });
});
