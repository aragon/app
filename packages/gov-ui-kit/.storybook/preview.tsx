import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect } from 'react';
import '../design-system/tokens/preview/index.css';
import '../index.css';
import { GukModulesProvider } from '../src/modules';
import { DocsPage } from './components';
import './style.css';
import tokenPreviews from './tokenPreviews.json';

// Token previews: the value sets of design-system/tokens/preview, which the published CSS does not carry. Each row of
// tokenPreviews.json is a toolbar global named after the `data-*` attribute it sets on the preview root, and a
// `pnpm visual-diff --<attribute> <mode>` option. The default mode sets no attribute.
const defaultMode = 'today';

const withTokenPreviews: Decorator = (Story, { globals }) => {
    useEffect(() => {
        const { dataset } = document.documentElement;
        for (const { attribute, modes } of tokenPreviews) {
            if (modes.includes(globals[attribute])) {
                dataset[attribute] = globals[attribute];
            } else {
                delete dataset[attribute];
            }
        }
    });

    return <Story />;
};

const tokenPreviewGlobalTypes = Object.fromEntries(
    tokenPreviews.map(({ attribute, title, icon, modes }) => [
        attribute,
        {
            description: `${title} of the design tokens`,
            toolbar: {
                title,
                icon,
                items: [defaultMode, ...modes].map((mode) => ({
                    value: mode,
                    title: mode.charAt(0).toUpperCase() + mode.slice(1),
                })),
                dynamicTitle: true,
            },
        },
    ]),
);

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
        withTokenPreviews,
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
        ...tokenPreviewGlobalTypes,
    },

    initialGlobals: Object.fromEntries(tokenPreviews.map(({ attribute }) => [attribute, defaultMode])),
};

export default preview;
