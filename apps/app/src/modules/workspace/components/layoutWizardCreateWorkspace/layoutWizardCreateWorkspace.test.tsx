import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-server';
import { featureFlags } from '@/shared/featureFlags';
import { LayoutWizardCreateWorkspace } from './layoutWizardCreateWorkspace';

jest.mock('next/navigation-server', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('@/modules/application/components/layouts/layoutWizard', () => ({
    LayoutWizard: () => <div data-testid="layout-wizard-mock" />,
}));

describe('<LayoutWizardCreateWorkspace /> component', () => {
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
    });

    const createTestComponent = async () =>
        await LayoutWizardCreateWorkspace({});

    it('renders the create workspace wizard when the workspaces flag is enabled', async () => {
        render(await createTestComponent());

        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByTestId('layout-wizard-mock')).toBeInTheDocument();
    });

    it('renders the 404 page instead of the wizard when the workspaces flag is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(createTestComponent()).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
    });
});
