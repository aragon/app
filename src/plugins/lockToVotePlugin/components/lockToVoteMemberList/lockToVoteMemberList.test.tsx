import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as wagmi from 'wagmi';
import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import { generateTokenMember } from '@/plugins/tokenPlugin/testUtils';
import type { ITokenMember } from '@/plugins/tokenPlugin/types';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import * as useLockToVoteLockOnboardingCheckModule from '../../hooks/useLockToVoteLockOnboardingCheck';
import { generateLockToVotePluginSettings } from '../../testUtils/generators/lockToVotePluginSettings';
import type { ILockToVotePlugin } from '../../types';
import {
    type ILockToVoteMemberListProps,
    LockToVoteMemberList,
} from './lockToVoteMemberList';

jest.mock(
    '@/plugins/tokenPlugin/components/tokenMemberList/components/tokenMemberListItem',
    () => ({
        TokenMemberListItem: (props: { member: ITokenMember }) => (
            <div data-testid="member-mock">{props.member.address}</div>
        ),
    }),
);

jest.mock(
    '@/plugins/tokenPlugin/components/tokenMemberList/components/tokenMemberListLockCardEmptyState',
    () => ({
        TokenMemberListLockCardEmptyState: () => (
            <div data-testid="lock-card-mock" />
        ),
    }),
);

describe('<LockToVoteMemberList /> component', () => {
    const useMemberListDataSpy = jest.spyOn(
        useMemberListData,
        'useMemberListData',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useLockOnboardingCheckSpy = jest.spyOn(
        useLockToVoteLockOnboardingCheckModule,
        'useLockToVoteLockOnboardingCheck',
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
        useLockOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: false,
            isLoading: false,
        });
    });

    afterEach(() => {
        useMemberListDataSpy.mockReset();
        useDaoSpy.mockReset();
        useConnectionSpy.mockReset();
        useLockOnboardingCheckSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<ILockToVoteMemberListProps>,
    ) => {
        const completeProps: ILockToVoteMemberListProps = {
            initialParams: {
                queryParams: { daoId: 'dao-id', pluginAddress: '0x123' },
            },
            plugin: {
                ...generateDaoPlugin({
                    settings: generateLockToVotePluginSettings(),
                }),
                lockManagerAddress: '0xlock',
            } as ILockToVotePlugin,
            ...props,
        };

        return (
            <GukModulesProvider>
                <LockToVoteMemberList {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the member list', () => {
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

    it('renders the lock card when shouldTrigger is true', () => {
        useLockOnboardingCheckSpy.mockReturnValue({
            shouldTrigger: true,
            isLoading: false,
        });
        render(createTestComponent());
        expect(screen.getByTestId('lock-card-mock')).toBeInTheDocument();
    });

    it('renders no lock card when shouldTrigger is false', () => {
        render(createTestComponent());
        expect(screen.queryByTestId('lock-card-mock')).not.toBeInTheDocument();
    });
});
