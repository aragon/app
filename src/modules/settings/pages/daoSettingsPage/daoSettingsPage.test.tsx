import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { DaoSettingsPage, type IDaoSettingsPageProps } from './daoSettingsPage';
import { DaoSettingsPageClient } from './daoSettingsPageClient';

jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    HydrationBoundary: (props: { children: ReactNode; state?: unknown }) => (
        <div data-testid="hydration-mock" data-state={JSON.stringify(props.state)}>
            {props.children}
        </div>
    ),
}));

jest.mock('./daoSettingsPageClient', () => ({
    DaoSettingsPageClient: jest.fn(() => <div>DaoSettingsPageClient Mock</div>),
}));

describe('<DaoSettingsPage /> component', () => {
    const createTestComponent = async (props?: Partial<IDaoSettingsPageProps>) => {
        const completeProps: IDaoSettingsPageProps = {
            params: { id: 'dao-id' },
            ...props,
        };
        const Component = await DaoSettingsPage(completeProps);

        return Component;
    };

    it('passes the correct daoId to DaoSettingsPageClient', async () => {
        const params = { id: 'my-dao' };

        render(await createTestComponent({ params }));
        expect(DaoSettingsPageClient).toHaveBeenCalledWith(
            expect.objectContaining({ daoId: params.id }),
            expect.any(Object),
        );
        expect(screen.getByText('DaoSettingsPageClient Mock')).toBeInTheDocument();
    });
});
