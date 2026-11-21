import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../index.css';
import { GukModulesProvider } from '../src/modules';
import { DocsPage } from './components';
import './style.css';

// Spacing preview of the semantic spacing roles (src/theme/tokens/spacing.css), an axis of its own: "today" is the
// default value set (no attribute), the New modes set `data-spacing` on the preview root.
const spacings = {
    today: { title: 'Today', attribute: undefined },
    new: { title: 'New', attribute: 'new' },
    looser: { title: 'New, looser', attribute: 'looser' },
    compact: { title: 'New, compact', attribute: 'compact' },
} as const;

type Spacing = keyof typeof spacings;

const withSpacing: Decorator = (Story, context) => {
    const attribute = spacings[context.globals.spacing as Spacing]?.attribute;

    useEffect(() => {
        const root = document.documentElement;
        if (attribute == null) {
            delete root.dataset.spacing;
        } else {
            root.dataset.spacing = attribute;
        }
    }, [attribute]);

    return <Story />;
};

const preview: Preview = {
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        options: {
            storySort: {
                method: 'alphabetical',
                order: [
                    'Docs',
                    ['Documentation', 'Installation', 'Changelog'],
                    'Theme',
                    ['Documentation'],
                    'Core',
                    ['Documentation'],
                    'Modules',
                    ['Documentation'],
                    'Utilities',
                ],
            },
        },
        backgrounds: {
            options: {
                'neutral-50': {
                    name: 'neutral-50',
                    value: 'var(--color-neutral-50)',
                },
            },
        },
        docs: {
            page: DocsPage,
        },
    },

    decorators: [
        withSpacing,
        (Story) => (
            <GukModulesProvider>
                <div className="flex">
                    <Story />
                </div>
            </GukModulesProvider>
        ),
    ],

    tags: ['autodocs'],

    // Needed to fix warning on HMR reload (see https://github.com/storybookjs/storybook-addon-pseudo-states/issues/59)
    globalTypes: {
        measureEnabled: {},
        backgrounds: {},
        outline: {},
        viewport: {},
        spacing: {
            description: 'Spacing of the semantic spacing roles',
            toolbar: {
                title: 'Spacing',
                icon: 'grow',
                items: Object.entries(spacings).map(([value, { title }]) => ({ value, title })),
                dynamicTitle: true,
            },
        },
    },

    initialGlobals: {
        backgrounds: {
            value: 'neutral-50',
        },
        spacing: 'today',
    },
};

export default preview;
