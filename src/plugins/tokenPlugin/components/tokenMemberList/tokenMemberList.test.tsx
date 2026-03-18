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
import * as useTokenDelegationOnboardingCheckModule from '../../hooks/useTokenDelegationOnboardingCheck';
import * as useTokenLockAndWrapOnboardingCheckModule from '../../hooks/useTokenLockAndWrapOnboardingCheck';
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

jest.mock('./components/tokenMemberListDelegationCardEmptyState', () => ({
    TokenMemberListDelegationCardEmptyState: () => (
        <div data-testid="delegation-card-mock" />
    ),
}));

jest.mock('./components/tokenMemberListLockCardEmptyState', () => ({
    TokenMemberListLockCardEmptyState: () => (
        <div data-testid="lock-card-mock" />
    ),
}));

jest.mock('./components/tokenMemberListWrapCardEmptyState', () => ({
    TokenMemberListWrapCardEmptyState: () => (
        <div data-testid="wrap-card-mock" />
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
    const useDelegationOnboardingCheckSpy = jest.spyOn(
        useTokenDelegationOnboardingCheckModule,
        'useTokenDelegationOnboardingCheck',
    );
    const useLockAndWrapOnboardingCheckSpy = jest.spyOn(
        useTokenLockAndWrapOnboardingCheckModule,
        'useTokenLockAndWrapOnboardingCheck',
    );

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
        useConnectionSpy.mockReturnValue({
            address: undefined,
        } as unknown as wagmi.UseConnectionReturnType);
        useDelegationOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: false,
            isLoading: false,
        });
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: false,
            isLoading: false,
        });
    });

    afterEach(() => {
        useMemberListDataSpy.mockReset();
        useDaoSpy.mockReset();
        useConnectionSpy.mockReset();
        useTokenCurrentDelegateSpy.mockReset();
        useMemberSpy.mockReset();
        useDelegationOnboardingCheckSpy.mockReset();
        useLockAndWrapOnboardingCheckSpy.mockReset();
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

    it('renders the delegation card when showDelegationCard is true', () => {
        useDelegationOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        render(createTestComponent());
        expect(screen.getByTestId('delegation-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
    });

    it('renders the lock card when showLockOrWrapCard is true and plugin has votingEscrow', () => {
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        const plugin = generateDaoPlugin({
            settings: generateTokenPluginSettings({
                votingEscrow: {
                    minDeposit: '0',
                    minLockTime: 0,
                    cooldown: 0,
                    maxTime: 0,
                    slope: 0,
                    bias: 0,
                },
            }),
        });
        render(createTestComponent({ plugin }));
        expect(screen.getByTestId('lock-card-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('delegation-card-mock'),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
    });

    it('renders the wrap card when showLockOrWrapCard is true and plugin has no votingEscrow', () => {
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        const plugin = generateDaoPlugin({
            settings: generateTokenPluginSettings({ votingEscrow: undefined }),
        });
        render(createTestComponent({ plugin }));
        expect(screen.getByTestId('wrap-card-mock')).toBeInTheDocument();
        expect(
            screen.queryByTestId('delegation-card-mock'),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
    });

    it('renders the delegation card over lock/wrap card when both conditions are true', () => {
        useDelegationOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        useLockAndWrapOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        render(createTestComponent());
        expect(screen.getByTestId('delegation-card-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
    });

    it('renders no onboarding card when neither condition is true', () => {
        render(createTestComponent());
        expect(
            screen.queryByTestId('delegation-card-mock'),
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('wrap-card-mock')).not.toBeInTheDocument();
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
        expect(memberElements).toHaveLength(2);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(
            '0x9999999999999999999999999999999999999999',
        );
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

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(2);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(delegateAddr);
        expect(memberElements[1].getAttribute('data-is-delegate')).toBe('true');
    });

    it('keeps the rendered member count aligned with the backend page size', () => {
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

        render(createTestComponent());

        const memberElements = screen.getAllByTestId('member-mock');
        expect(memberElements).toHaveLength(paginatedMembers.length);
        expect(memberElements[0].textContent).toBe(userAddress);
        expect(memberElements[1].textContent).toBe(delegateAddr);
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
