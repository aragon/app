import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultError, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { IconType, addressUtils, clipboardUtils } from '@aragon/ods';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { NavigationDao, type INavigationDaoProps } from './navigationDao';
import { navigationDaoLinks } from './navigationDaoLinks';

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual('@aragon/ods'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
}));

jest.mock('../navigation/navigationTrigger', () => ({
    NavigationTrigger: (props: { onClick: () => void; className: string }) => (
        <button data-testid="nav-trigger-mock" onClick={props.onClick} className={props.className} />
    ),
}));

describe('<NavigationDao /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');
    const copySpy = jest.spyOn(clipboardUtils, 'copy');

    beforeEach(() => {
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: generateDao() }));
    });

    afterEach(() => {
        useDaoSpy.mockReset();
        cidToSrcSpy.mockReset();
    });

    const createTestComponent = (props?: Partial<INavigationDaoProps>) => {
        const completeProps: INavigationDaoProps = {
            slug: 'test-dao',
            ...props,
        };

        return <NavigationDao {...completeProps} />;
    };

    it('renders the dao avatar and name', () => {
        const dao = generateDao({ avatar: 'ipfs://avatar-cid', name: 'MyDao' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        cidToSrcSpy.mockReturnValue(dao.avatar!);
        render(createTestComponent());
        const daoAvatar = screen.getByTestId('dao-avatar-mock');
        expect(daoAvatar).toBeInTheDocument();
        expect(daoAvatar.dataset.src).toEqual(dao.avatar);
        expect(screen.getByText(dao.name)).toBeInTheDocument();
    });

    it('renders the DAO links for the current DAO on desktop devices', () => {
        const slug = 'test-dao';
        const daoLinks = navigationDaoLinks(slug);
        render(createTestComponent({ slug }));
        daoLinks.forEach((link) => expect(screen.getByRole('link', { name: link.label })).toBeInTheDocument());
        // eslint-disable-next-line testing-library/no-node-access
        expect(screen.getByRole('link', { name: daoLinks[0].label }).parentElement?.className).toContain(
            'hidden md:flex',
        );
    });

    it('renders a button to open the navigation dialog on mobile devices', async () => {
        render(createTestComponent());
        const triggerButton = screen.getByTestId('nav-trigger-mock');
        expect(triggerButton).toBeInTheDocument();
        expect(triggerButton?.className).toContain('md:hidden');
        await userEvent.click(triggerButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('renders the dao information on the navigation dialog', async () => {
        const dao = generateDao({ name: 'dao name', ens: 'dao ens' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        const withinDialog = within(screen.getByRole('dialog'));
        expect(withinDialog.getByTestId('dao-avatar-mock')).toBeInTheDocument();
        expect(withinDialog.getByText(dao.name)).toBeInTheDocument();
        expect(withinDialog.getByText(dao.ens!)).toBeInTheDocument();
    });

    it('renders the truncated address on the navigation dialog when dao has no ENS', async () => {
        const dao = generateDao({ daoAddress: '0xDafBD7d63CEe88d73a51592b42f27f7FD6ab7722', ens: undefined });
        const truncatedAddress = addressUtils.truncateAddress(dao.daoAddress);
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));
        expect(screen.getByText(truncatedAddress)).toBeInTheDocument();
    });

    it('renders a copy button to copy the DAO address on the navigation dialog', async () => {
        const dao = generateDao({ daoAddress: '0x1234' });
        useDaoSpy.mockReturnValue(generateReactQueryResultSuccess({ data: dao }));
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        const copyButton = screen.getByTestId(IconType.COPY);
        expect(copyButton).toBeInTheDocument();

        await userEvent.click(copyButton);
        expect(copySpy).toHaveBeenCalledWith(dao.daoAddress);
    });

    it('renders a explore button to navigate to the explore page on the navigation dialog', async () => {
        render(createTestComponent());
        await userEvent.click(screen.getByTestId('nav-trigger-mock'));

        const exploreButton = screen
            .getAllByRole<HTMLAnchorElement>('link')
            .find((link) => within(link).queryByTestId(IconType.APP_EXPLORE))!;
        expect(exploreButton).toBeInTheDocument();
        expect(exploreButton.href).toEqual('http://localhost/');

        await userEvent.click(exploreButton);
        expect(screen.getByRole('dialog').dataset.state).toEqual('closed');
    });

    it('does not crash when dao cannot be fetched', () => {
        useDaoSpy.mockReturnValue(generateReactQueryResultError({ error: new Error() }));
        render(createTestComponent());
        expect(screen.getByTestId('dao-avatar-mock')).toBeInTheDocument();
    });
});
