import * as DaoService from '@/shared/api/daoService';
import { generateDao, generateReactQueryResultSuccess } from '@/shared/testUtils';
import { ipfsUtils } from '@/shared/utils/ipfsUtils';
import { render, screen } from '@testing-library/react';
import { NavigationDao, type INavigationDaoProps } from './navigationDao';

jest.mock('@aragon/ods', () => ({
    ...jest.requireActual<object>('@aragon/ods'),
    DaoAvatar: (props: { src: string }) => <div data-testid="dao-avatar-mock" data-src={props.src} />,
}));

describe('<NavigationDao /> component', () => {
    const useDaoSpy = jest.spyOn(DaoService, 'useDao');
    const cidToSrcSpy = jest.spyOn(ipfsUtils, 'cidToSrc');

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
});
