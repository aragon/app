import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import { daoUtils } from '@/shared/utils/daoUtils';
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
    TokenMemberListItem: (props: { member: ITokenMember }) => (
        <div data-testid="member-mock">{props.member.address}</div>
    ),
}));

describe('<TokenMemberListBase />', () => {
    const useMemberListDataSpy = jest.spyOn(
        useMemberListData,
        'useMemberListData',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const resolvePluginDaoIdSpy = jest.spyOn(daoUtils, 'resolvePluginDaoId');

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
    });

    afterEach(() => {
        useMemberListDataSpy.mockReset();
        useDaoSpy.mockReset();
        resolvePluginDaoIdSpy.mockReset();
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

    describe('linked-account daoId resolution', () => {
        it('passes the original params to useMemberListData for non-linked-account plugins', () => {
            const initialParams = {
                queryParams: { daoId: 'dao-id', pluginAddress: '0x123' },
            };
            resolvePluginDaoIdSpy.mockReturnValue('dao-id');
            render(createTestComponent({ initialParams }));
            expect(useMemberListDataSpy).toHaveBeenCalledWith(initialParams);
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
