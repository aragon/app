import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../index.css';
import { GukModulesProvider } from '../src/modules';
import { DocsPage } from './components';
import './nextTypographyFonts.css';
import './style.css';

// Typography preview of the semantic type roles (src/theme/tokens/typography.css), an axis of its own, independent of
// the colour theme: "today" is the default value set (no attribute), "next" sets `data-typography` on the preview root.
// The Next faces are loaded by ./nextTypographyFonts.css, never by the published kit.
const typographies = {
    today: { title: 'Today', attribute: undefined },
    next: { title: 'Next', attribute: 'next' },
} as const;

type Typography = keyof typeof typographies;

const withTypography: Decorator = (Story, context) => {
    const attribute = typographies[context.globals.typography as Typography]?.attribute;

    useEffect(() => {
        const root = document.documentElement;
        if (attribute == null) {
            delete root.dataset.typography;
        } else {
            root.dataset.typography = attribute;
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
        withTypography,
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
        typography: {
            description: 'Typography of the semantic type roles',
            toolbar: {
                title: 'Typography',
                icon: 'paragraph',
                items: Object.entries(typographies).map(([value, { title }]) => ({ value, title })),
                dynamicTitle: true,
            },
        },
    },

    initialGlobals: {
        backgrounds: {
            value: 'neutral-50',
        },
        typography: 'today',
    },
};

export default preview;
