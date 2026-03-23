import { GukModulesProvider } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as wagmi from 'wagmi';
import * as ensModule from '@/modules/ens';
import type { IMember } from '@/modules/governance/api/governanceService';
import * as governanceService from '@/modules/governance/api/governanceService';
import * as useMemberListData from '@/modules/governance/hooks/useMemberListData';
import { generateMember } from '@/modules/governance/testUtils';
import * as daoService from '@/shared/api/daoService';
import {
    generateDao,
    generateDaoPlugin,
    generateReactQueryResultSuccess,
} from '@/shared/testUtils';
import {
    DaoMemberListDefault,
    type IDaoMemberListDefaultProps,
} from './daoMemberListDefault';

describe('<DaoMemberListDefault /> component', () => {
    const useMemberListDataSpy = jest.spyOn(
        useMemberListData,
        'useMemberListData',
    );
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useConnectionSpy = jest.spyOn(wagmi, 'useConnection');
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const useMemberExistsSpy = jest.spyOn(governanceService, 'useMemberExists');
    const useEnsNameSpy = jest.spyOn(ensModule, 'useEnsName');
    const useEnsAvatarSpy = jest.spyOn(ensModule, 'useEnsAvatar');

    const mockEnsNameByAddress = (entries: Record<string, string | null>) => {
        useEnsNameSpy.mockImplementation(((address) => ({
            data: address ? (entries[address] ?? null) : null,
            isLoading: false,
        })) as typeof ensModule.useEnsName);
    };

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
        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: undefined as unknown as IMember,
            }),
        );
        useMemberExistsSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { status: false } }),
        );
        useEnsNameSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsName>);
        useEnsAvatarSpy.mockReturnValue({
            data: null,
            isLoading: false,
        } as ReturnType<typeof ensModule.useEnsAvatar>);
    });

    afterEach(() => {
        useMemberListDataSpy.mockReset();
        useDaoSpy.mockReset();
        useConnectionSpy.mockReset();
        useMemberSpy.mockReset();
        useMemberExistsSpy.mockReset();
        useEnsNameSpy.mockReset();
        useEnsAvatarSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<IDaoMemberListDefaultProps>,
    ) => {
        const completeProps: IDaoMemberListDefaultProps = {
            initialParams: {
                queryParams: { daoId: 'dao-id', pluginAddress: '0x123' },
            },
            plugin: generateDaoPlugin(),
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoMemberListDefault {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the multisig member list', () => {
        const resolvedEns = 'member-1';
        const members = [
            generateMember({ address: '0x123' }),
            generateMember({ address: '0x456', ens: resolvedEns }),
        ];
        mockEnsNameByAddress({
            '0x123': null,
            '0x456': resolvedEns,
        });
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
        expect(screen.getByText(members[0].address)).toBeInTheDocument();
        expect(screen.getByText(resolvedEns)).toBeInTheDocument();
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('does not render the data-list pagination when hidePagination is set to true', () => {
        const hidePagination = true;
        useMemberListDataSpy.mockReturnValue({
            memberList: [generateMember()],
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

    it('pins the connected user to the top of the member list', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const otherAddress = '0x9999999999999999999999999999999999999999';
        const userMember = generateMember({
            address: userAddress,
            ens: 'you.eth',
        });
        const otherMember = generateMember({
            address: otherAddress,
            ens: 'other.eth',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);
        mockEnsNameByAddress({
            [userAddress]: 'you.eth',
            [otherAddress]: 'other.eth',
        });

        useMemberExistsSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { status: true } }),
        );

        useMemberListDataSpy.mockReturnValue({
            memberList: [otherMember, userMember],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: userMember }),
        );

        render(createTestComponent());

        const headings = screen.getAllByRole('heading');
        const memberNames = headings
            .map((h) => h.textContent)
            .filter((t) => t === 'you.eth' || t === 'other.eth');
        expect(memberNames[0]).toBe('you.eth');
        expect(memberNames[1]).toBe('other.eth');
    });

    it('does not pin when user is not a member', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const otherMember = generateMember({
            address: '0x9999999999999999999999999999999999999999',
            ens: 'other.eth',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);
        mockEnsNameByAddress({
            [otherMember.address]: 'other.eth',
        });

        useMemberListDataSpy.mockReturnValue({
            memberList: [otherMember],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 1,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({
                data: undefined as unknown as IMember,
            }),
        );

        render(createTestComponent());

        const headings = screen.getAllByRole('heading');
        const memberNames = headings
            .map((h) => h.textContent)
            .filter((t) => t === 'other.eth');
        expect(memberNames).toHaveLength(1);
    });

    it('deduplicates pinned user from the paginated list', () => {
        const userAddress = '0x1234567890abcdef1234567890abcdef12345678';
        const userMember = generateMember({
            address: userAddress,
            ens: 'you.eth',
        });
        const otherMember = generateMember({
            address: '0x9999999999999999999999999999999999999999',
            ens: 'other.eth',
        });

        useConnectionSpy.mockReturnValue({
            address: userAddress,
        } as unknown as wagmi.UseConnectionReturnType);
        mockEnsNameByAddress({
            [userAddress]: 'you.eth',
            [otherMember.address]: 'other.eth',
        });

        useMemberExistsSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { status: true } }),
        );

        useMemberListDataSpy.mockReturnValue({
            memberList: [otherMember, userMember],
            onLoadMore: jest.fn(),
            state: 'idle',
            pageSize: 10,
            itemsCount: 2,
            emptyState: { heading: '', description: '' },
            errorState: { heading: '', description: '' },
        });

        useMemberSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: userMember }),
        );

        render(createTestComponent());

        const headings = screen.getAllByRole('heading');
        const youCount = headings.filter(
            (h) => h.textContent === 'you.eth',
        ).length;
        expect(youCount).toBe(1);
    });
});
