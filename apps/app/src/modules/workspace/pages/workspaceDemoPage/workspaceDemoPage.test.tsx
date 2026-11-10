import { render, screen } from '@testing-library/react';
import { notFound } from 'next/navigation-original';
import { featureFlags } from '@/shared/featureFlags';
import { WorkspaceDemoPage } from './workspaceDemoPage';

jest.mock('next/navigation-original', () => ({
    notFound: jest.fn(() => {
        throw new Error('NEXT_HTTP_ERROR_FALLBACK;404');
    }),
}));

jest.mock('./workspaceDemoPageClient', () => ({
    WorkspaceDemoPageClient: () => <div>demo page client</div>,
}));

describe('<WorkspaceDemoPage /> component', () => {
    const notFoundMock = notFound as jest.MockedFunction<typeof notFound>;
    const isEnabledSpy = jest.spyOn(featureFlags, 'isEnabled');

    beforeEach(() => {
        isEnabledSpy.mockResolvedValue(true);
    });

    afterEach(() => {
        isEnabledSpy.mockReset();
        notFoundMock.mockClear();
    });

    it('renders the installer when the workspaces feature is enabled', async () => {
        render(await WorkspaceDemoPage({}));

        expect(isEnabledSpy).toHaveBeenCalledWith('workspaces');
        expect(notFoundMock).not.toHaveBeenCalled();
        expect(screen.getByText('demo page client')).toBeInTheDocument();
    });

    it('renders the 404 page when the workspaces feature is disabled', async () => {
        isEnabledSpy.mockResolvedValue(false);

        await expect(WorkspaceDemoPage({})).rejects.toThrow(
            'NEXT_HTTP_ERROR_FALLBACK;404',
        );
        expect(notFoundMock).toHaveBeenCalled();
    });
});
