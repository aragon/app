import { DaoList } from '@/modules/explore/components/daoList';
import * as efpService from '@/modules/governance/api/efpService';
import * as daoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { addressUtils, clipboardUtils, DateFormat, formatterUtils, GukModulesProvider } from '@aragon/gov-ui-kit';
import type * as ReactQuery from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as governanceService from '../../api/governanceService';
import { generateMember, generateMemberMetrics } from '../../testUtils';
import { DaoMemberDetailsPageClient, type IDaoMemberDetailsPageClientProps } from './daoMemberDetailsPageClient';

jest.mock('@aragon/gov-ui-kit', () => ({
    ...jest.requireActual<typeof ReactQuery>('@aragon/gov-ui-kit'),
    MemberAvatar: (props: { src: string }) => <div data-testid="avatar-mock" data-src={props.src} />,
}));

jest.mock('../../../explore/components/daoList', () => ({
    DaoList: jest.fn(() => <div data-testid="dao-list-mock" />),
}));

jest.mock('@/modules/governance/components/voteList', () => ({
    VoteList: jest.fn(() => <div data-testid="vote-list-mock" />),
}));

describe('<DaoMemberDetailsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');
    const useEfpStatsSpy = jest.spyOn(efpService, 'useEfpStats');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateMember() }));
        useEfpStatsSpy.mockReturnValue(
            generateReactQueryResultSuccess({ data: { followers_count: 1, following_count: 2 } }),
        );
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useMemberSpy.mockReset();
        clipboardCopySpy.mockReset();
        useEfpStatsSpy.mockReset();
        (DaoList as jest.Mock).mockClear();
    });

    const createTestComponent = (props?: Partial<IDaoMemberDetailsPageClientProps>) => {
        const completeProps: IDaoMemberDetailsPageClientProps = {
            daoId: 'dao-id',
            address: '0x1234567890123456789012345678901234567890',
            ...props,
        };

        return (
            <GukModulesProvider>
                <DaoMemberDetailsPageClient {...completeProps} />
            </GukModulesProvider>
        );
    };

    it('fetches and renders the member ens and avatar', () => {
        const address = '0x1234567890123456789012345678901234567890';
        const daoId = 'dao-id';
        const ens = 'member.eth';
        const member = generateMember({ ens, address });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));
        render(createTestComponent({ address, daoId }));

        expect(useMemberSpy).toHaveBeenCalledWith({ urlParams: { address }, queryParams: { daoId } });
        const ensHeading = screen.getByRole('heading', { level: 1, name: ens });
        expect(ensHeading).toBeInTheDocument();

        const avatar = screen.getByTestId('avatar-mock');
        expect(avatar).toBeInTheDocument();
    });

    it('returns empty container on member fetch error', () => {
        useMemberSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        const { container } = render(createTestComponent());
        expect(container).toBeEmptyDOMElement();
    });

    it('renders a dropdown with some member information to copy on the clipboard', async () => {
        const ens = 'member.eth';
        const address = '0x1234567890123456789012345678901234567890';
        const member = generateMember({ ens, address });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));
        render(createTestComponent({ address }));

        const dropdownButton = screen.getByRole('button', { name: ens });
        expect(dropdownButton).toBeInTheDocument();

        await userEvent.click(dropdownButton);
        const ensItem = screen.getByRole('menuitem', { name: ens });
        expect(ensItem).toBeInTheDocument();
        await userEvent.click(ensItem);
        expect(clipboardCopySpy).toHaveBeenCalledWith(ens);

        await userEvent.click(dropdownButton);
        const addressItem = screen.getByRole('menuitem', { name: addressUtils.truncateAddress(member.address) });
        expect(addressItem).toBeInTheDocument();
        await userEvent.click(addressItem);
        expect(clipboardCopySpy).toHaveBeenCalledWith(member.address);

        await userEvent.click(dropdownButton);
        const memberLinkItem = screen.getByRole('menuitem', { name: 'localhost/' });
        expect(memberLinkItem).toBeInTheDocument();
        await userEvent.click(memberLinkItem);
        expect(clipboardCopySpy).toHaveBeenCalledWith('localhost/');
    });

    it('renders the member information', () => {
        const ens = 'member.eth';
        const address = '0x1234567890123456789012345678901234567890';
        const member = generateMember({ ens, address });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));
        render(createTestComponent({ address }));

        expect(screen.getByText(/daoMemberDetailsPage.aside.details.title/)).toBeInTheDocument();

        expect(screen.getByText(/daoMemberDetailsPage.aside.details.address/)).toBeInTheDocument();
        const memberAddressLink = screen.getByRole('link', { name: addressUtils.truncateAddress(member.address) });

        expect(memberAddressLink).toBeInTheDocument();
        expect(memberAddressLink).toHaveAttribute('href', expect.stringMatching(member.address));

        expect(screen.getByText(/daoMemberDetailsPage.aside.details.ens/)).toBeInTheDocument();
        const memberEnsLink = screen.getByRole('link', { name: ens });
        expect(memberEnsLink).toBeInTheDocument();
        expect(memberEnsLink).toHaveAttribute('href', expect.stringMatching(member.address));

        expect(screen.getByText(/daoMemberDetailsPage.aside.details.firstActivity/)).toBeInTheDocument();
    });

    it('renders the formatted member stats', () => {
        render(createTestComponent());

        expect(screen.getByText(/daoMemberDetailsPage.header.stat.latestActivity/)).toBeInTheDocument();
    });

    it('passes the correct params to the DaoList component', () => {
        const address = '0x1234567890123456789012345678901234567890';
        const daoId = 'dao-id';
        const member = generateMember({ ens: 'member.eth', address });
        const pageSize = 3;
        const excludeDaoId = daoId;

        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));

        render(createTestComponent({ address, daoId }));

        expect(DaoList).toHaveBeenCalledWith(
            expect.objectContaining({
                daoListByMemberParams: {
                    urlParams: { address },
                    queryParams: { pageSize, excludeDaoId },
                },
            }),
            undefined,
        );
    });

    it('renders fallback of `-` when lastActivity is null', () => {
        const metrics = generateMemberMetrics({ lastActivity: null, firstActivity: 1723472877 });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateMember({ metrics }) }));

        render(createTestComponent());
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders the correct last activity date', () => {
        const metrics = generateMemberMetrics({ lastActivity: 1723472877 });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateMember({ metrics }) }));

        render(createTestComponent());
        const duration = formatterUtils.formatDate(metrics.lastActivity! * 1000, { format: DateFormat.DURATION });
        const [value] = duration?.split(' ') ?? [];

        expect(screen.getByText(value)).toBeInTheDocument();
        expect(screen.getByText(/daoMemberDetailsPage.header.stat.latestActivityUnit/)).toBeInTheDocument();
    });

    it('renders fallback of `-` when firstActivity is null', () => {
        const metrics = generateMemberMetrics({ firstActivity: null, lastActivity: 1723472877 });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateMember({ metrics }) }));

        render(createTestComponent());
        expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('renders the correct first activity date', () => {
        const metrics = generateMemberMetrics({ firstActivity: 1723472877 });
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateMember({ metrics }) }));

        render(createTestComponent());

        const firstActivityDate = formatterUtils.formatDate(metrics.firstActivity! * 1000, {
            format: DateFormat.YEAR_MONTH_DAY,
        });
        expect(screen.getByText(firstActivityDate!)).toBeInTheDocument();
    });
});
