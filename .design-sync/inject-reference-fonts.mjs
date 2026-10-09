// The kit Storybook build copies fonts to fonts/src/theme/fonts/ while its CSS
// requests /fonts/Manrope-*.ttf, so the reference renders a fallback typeface.
// Point the reference iframe at the copied files so grading compares Manrope.
import { readFileSync, writeFileSync } from 'node:fs';

const iframe = new URL('./sb-reference/iframe.html', import.meta.url);
const marker = 'ds-reference-fonts';
const face = (weight, file) =>
    `@font-face{font-family:Manrope;font-style:normal;font-weight:${weight};font-display:swap;src:url(./fonts/src/theme/fonts/${file}) format("truetype")}`;
const html = readFileSync(iframe, 'utf8');

if (!html.includes(marker)) {
    const style = `<style id="${marker}">${face(400, 'Manrope-Regular.ttf')}${face(600, 'Manrope-SemiBold.ttf')}</style>`;
    writeFileSync(iframe, html.replace('</head>', `${style}</head>`));
}
