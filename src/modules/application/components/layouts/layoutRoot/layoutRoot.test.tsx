import { testLogger } from '@/test/utils';
import { render, screen } from '@testing-library/react';
import { LayoutRoot, type ILayoutRootProps } from './layoutRoot';

describe('<LayoutRoot /> component', () => {
    const createServerComponent = async (props?: Partial<ILayoutRootProps>) => {
        const completeProps: ILayoutRootProps = { ...props };
        const Component = await LayoutRoot(completeProps);

        return Component;
    };

    beforeEach(() => {
        // Suppress "<html> cannot appear as a child of <div>" warnings.
        // To be fixed by React 19 migration (see https://github.com/testing-library/react-testing-library/issues/1250)
        testLogger.suppressErrors();
    });

    it('renders the children property and the application footer', async () => {
        const children = 'test-children';
        render(await createServerComponent({ children }));
        expect(screen.getByText(children)).toBeInTheDocument();
        expect(screen.getByText(/footer.link.explore/)).toBeInTheDocument();
    });
});
