import { IconType } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import * as NextNavigation from 'next/navigation';
import {
    type INavigationLinksGroupProps,
    NavigationLinksGroup,
} from './navigationLinksGroup';

describe('<NavigationLinksGroup /> component', () => {
    const usePathnameSpy = jest.spyOn(NextNavigation, 'usePathname');

    beforeEach(() => {
        usePathnameSpy.mockReturnValue('');
    });

    afterEach(() => {
        usePathnameSpy.mockReset();
    });

    const createTestComponent = (
        props?: Partial<INavigationLinksGroupProps>,
    ) => {
        const completeProps: INavigationLinksGroupProps = {
            group: { id: 'group', links: [] },
            ...props,
        };

        return <NavigationLinksGroup {...completeProps} />;
    };

    it('renders the label above the links of the group', () => {
        render(
            createTestComponent({
                group: {
                    id: 'inbox',
                    label: 'Inbox',
                    links: [
                        {
                            label: 'To-dos',
                            link: '/todos',
                            icon: IconType.CHECKMARK,
                        },
                    ],
                },
            }),
        );

        expect(screen.getByText('Inbox')).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: 'To-dos' }),
        ).toBeInTheDocument();
    });

    it('renders nothing, label included, when every link is hidden', () => {
        const { container } = render(
            createTestComponent({
                group: {
                    id: 'inbox',
                    label: 'Inbox',
                    links: [
                        {
                            label: 'To-dos',
                            link: '/todos',
                            icon: IconType.CHECKMARK,
                            hidden: true,
                        },
                    ],
                },
            }),
        );

        expect(container).toBeEmptyDOMElement();
    });
});
