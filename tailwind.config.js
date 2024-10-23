/** @type {import('tailwindcss').Config} */
module.exports = {
    presets: [require('@aragon/gov-ui-kit/tailwind.config')],
    content: ['./src/**/*.{tsx,html}', './node_modules/@aragon/gov-ui-kit/**/*.js'],
    plugins: [
        require('tailwindcss-fluid-type')({
            settings: {
                ratioMin: 1.2,
                ratioMax: 1.25,
                fontSizeMin: 0.875,
                fontSizeMax: 1,
                screenMin: 20,
                screenMax: 96,
                unit: 'rem',
                prefix: 'ft-',
            },
            values: {
                xs: [-2, 1.5],
                sm: [-1, 1.5],
                base: [0, 1.5],
                lg: [1, 1.5],
                xl: [2, 1.2],
                '2xl': [3, 1.2],
                '3xl': [4, 1.2],
                '4xl': [5, 1.2],
                '5xl': [6, 1.2],
            },
        }),
    ],
};
