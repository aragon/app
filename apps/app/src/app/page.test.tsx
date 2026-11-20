import { render, screen } from '@testing-library/react';
import { featureFlags } from '@/shared/featureFlags';
import HomePage from './page';

jest.mock('@/modules/application/pages/landingPage', () => ({
    LandingPage: () => <div data-testid="landing-page" />,
}));

jest.mock('@/modules/explore/pages/exploreDaosPage', () => ({
    ExploreDaosPage: () => <div data-testid="explore-page" />,
}));

describe('<HomePage /> component', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    afterEach(() => {
        isEnabledSpy.mockReset();
    });

    it('renders Explore when workspaces are disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        render(await HomePage());

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(screen.getByTestId('explore-page')).toBeInTheDocument();
        expect(screen.queryByTestId('landing-page')).not.toBeInTheDocument();
    });

    it('renders the landing page when workspaces are enabled', async () => {
        isEnabledSpy.mockResolvedValue(true);

        render(await HomePage());

        expect(screen.getByTestId('landing-page')).toBeInTheDocument();
        expect(screen.queryByTestId('explore-page')).not.toBeInTheDocument();
    });
});
