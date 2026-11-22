import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../index.css';
import { GukModulesProvider } from '../src/modules';
import { DocsPage } from './components';
import './nextTypographyFonts.css';
import './tokensPreview.css';
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
        // The canvas follows the theme (bg-body); the backgrounds addon would paint over it, so it is turned off.
        backgrounds: { disable: true },
        docs: {
            page: DocsPage,
        },
    },

    decorators: [
        withTheme,
        withTypography,
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
        typography: {
            description: 'Typography of the semantic type roles',
            toolbar: {
                title: 'Typography',
                icon: 'paragraph',
                items: Object.entries(typographies).map(([value, { title }]) => ({ value, title })),
                dynamicTitle: true,
            },
        },
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
        theme: 'today',
        typography: 'today',
        spacing: 'today',
    },
};

export default preview;
