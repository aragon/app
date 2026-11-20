import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import ExplorePage from './page';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('@/modules/explore/pages/exploreDaosPage', () => ({
    ExploreDaosPage: () => <div data-testid="explore-page" />,
}));

describe('<ExplorePage /> component', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
    });

    it('renders Explore when workspaces are enabled', async () => {
        isEnabledSpy.mockResolvedValue(true);

        render(await ExplorePage());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('explore-page')).toBeInTheDocument();
    });

    it('renders the 404 page when workspaces are disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(ExplorePage()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
    });
});
