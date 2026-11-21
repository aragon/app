import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../index.css';
import { GukModulesProvider } from '../src/modules';
import { DocsPage } from './components';
import './style.css';

// Colour themes of the semantic tokens (src/theme/tokens/semantic): "today" is the default value set (no attribute),
// "next" and "dark" set `data-theme` on the preview root. The canvas is painted with bg-body in .storybook/style.css.
const themes = {
    today: { title: 'Today', attribute: undefined },
    next: { title: 'Next', attribute: 'next' },
    dark: { title: 'Dark', attribute: 'dark' },
} as const;

type Theme = keyof typeof themes;

const withTheme: Decorator = (Story, context) => {
    const attribute = themes[context.globals.theme as Theme]?.attribute;

    useEffect(() => {
        const root = document.documentElement;
        if (attribute == null) {
            delete root.dataset.theme;
        } else {
            root.dataset.theme = attribute;
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
        // The canvas follows the theme (bg-body); the backgrounds addon would paint over it, so it is turned off.
        backgrounds: { disable: true },
        docs: {
            page: DocsPage,
        },
    },

    decorators: [
        withTheme,
        (Story) => (
            <GukModulesProvider>
                <div className="flex">
                    <Story />
                </div>
            </GukModulesProvider>
        ),
    ],

    tags: ['autodocs'],

    // The empty entries are needed to fix a warning on HMR reload
    // (see https://github.com/storybookjs/storybook-addon-pseudo-states/issues/59)
    globalTypes: {
        measureEnabled: {},
        backgrounds: {},
        outline: {},
        viewport: {},
        theme: {
            description: 'Colour theme of the semantic tokens',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                items: Object.entries(themes).map(([value, { title }]) => ({ value, title })),
                dynamicTitle: true,
            },
        },
    },

    initialGlobals: {
        theme: 'today',
    },
};

export default preview;
