import * as daoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { addressUtils, clipboardUtils, OdsModulesProvider } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import * as governanceService from '../../api/governanceService';

import { DaoList } from '@/modules/explore/components/daoList';
import { userEvent } from '@testing-library/user-event';
import { generateMember } from '../../testUtils';
import { DaoMemberDetailsPageClient, type IDaoMemberDetailsPageClientProps } from './daoMemberDetailsPageClient';

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    MemberAvatar: (props: { src: string }) => <div data-testid="avatar-mock" data-src={props.src} />,
}));

jest.mock('../../../explore/components/daoList', () => ({
    DaoList: jest.fn(() => <div data-testid="dao-list-mock" />),
}));

describe('<DaoMemberDetailsPageClient /> component', () => {
    const useDaoSpy = jest.spyOn(daoService, 'useDao');
    const useMemberSpy = jest.spyOn(governanceService, 'useMember');
    const clipboardCopySpy = jest.spyOn(clipboardUtils, 'copy');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateMember() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        useMemberSpy.mockReset();
        clipboardCopySpy.mockReset();
        (DaoList as jest.Mock).mockClear();
    });

    const createTestComponent = (props?: Partial<IDaoMemberDetailsPageClientProps>) => {
        const completeProps: IDaoMemberDetailsPageClientProps = {
            daoId: 'dao-id',
            address: '0x1234567890123456789012345678901234567890',
            ...props,
        };

        return (
            <OdsModulesProvider>
                <DaoMemberDetailsPageClient {...completeProps} />
            </OdsModulesProvider>
        );
    };

    it('fetches and renders the member ens and avatar', () => {
        const address = '0x1234567890123456789012345678901234567890';
        const daoId = 'dao-id';
        const ens = 'member.eth';
        const member = generateMember({
            ens,
            address,
        });
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
        const member = generateMember({
            ens,
            address,
        });
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

        useMemberSpy.mockReturnValue(generateReactQueryResultSuccess({ data: member }));
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));

        render(createTestComponent({ address, daoId }));

        expect(DaoList).toHaveBeenCalledWith(
            expect.objectContaining({
                daoListByMemberParams: {
                    urlParams: { address },
                    queryParams: { pageSize: 3 },
                },
            }),
            {},
        );
    });
});
