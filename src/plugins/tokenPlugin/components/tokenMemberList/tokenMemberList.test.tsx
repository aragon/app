import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as wagmi from 'wagmi';
import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as useTokenDelegationOnboardingCheckModule from '../../hooks/useTokenDelegationOnboardingCheck';
import * as useTokenLockAndWrapOnboardingCheckModule from '../../hooks/useTokenLockAndWrapOnboardingCheck';
import {
    generateTokenMember,
    generateTokenPluginSettings,
} from '../../testUtils';
import type { ITokenMember } from '../../types';
import { type ITokenMemberListProps, TokenMemberList } from './tokenMemberList';

jest.mock('./components/tokenMemberListItem', () => ({
    TokenMemberListItem: (props: { member: ITokenMember }) => (
        <div data-testid="member-mock">{props.member.address}</div>
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
            generateReactQueryResultSuccess({ data: generateDao() }),
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
});
