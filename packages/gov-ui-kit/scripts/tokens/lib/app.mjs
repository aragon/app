// The app artifact (`.design-sync/generated/govkit-primitives.css`): the primitive CSS flattened into one entry, font
// URLs rebased to the artifact's location, plus the app's runtime overrides. The app imports this file instead of the
// kit's primitives barrel.

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import postcss from 'postcss';

const collapse = (text) => text.trim();

// The overrides file is generator input only. Its :root rule may hold nothing but direct custom-property
// declarations (no nesting, no conditions, no !important), because the artifact copies the rule verbatim and the
// consumer resolves it against the primitives above it. Top-level comments, @import and @source are allowed.
export const readAppOverrides = (file, label) => {
    const root = postcss.parse(readFileSync(file, 'utf8'));
    const rules = [];
    root.each((node) => {
        if (node.type === 'comment') {
            return;
        }
        if (node.type === 'atrule' && (node.name === 'import' || node.name === 'source')) {
            return;
        }
        if (node.type !== 'rule' || node.selector !== ':root') {
            throw new Error(
                `Unsupported scoped or conditional construct in ${label}: "${collapse(node.toString()).slice(0, 80)}"`,
            );
        }
        node.each((child) => {
            if (child.type === 'comment') {
                return;
            }
            if (child.type !== 'decl') {
                throw new Error(
                    `Unsupported nested or conditional scope in ${label}: "${collapse(child.toString()).slice(0, 80)}"`,
                );
            }
            if (!child.prop.startsWith('--')) {
                throw new Error(
                    `Unsupported non-custom property declaration "${collapse(child.toString())}" in ${label}; runtime overrides may only set CSS custom properties`,
                );
            }
            if (child.important) {
                throw new Error(`Unsupported !important on "${child.prop}" in ${label}`);
            }
        });
        rules.push(node);
    });
    assert.equal(rules.length, 1, `Expected one top-level :root in ${label}`);
    return rules[0].toString().trim();
};

const rebaseFontUrls = (css, { fontUrlFrom, fontUrlTo }) => {
    const rebased = css
        .replaceAll(`url("${fontUrlFrom}`, `url("${fontUrlTo}`)
        .replaceAll(`url('${fontUrlFrom}`, `url('${fontUrlTo}`);
    const unresolved = [...rebased.matchAll(/url\((['"]?)(\.\.?\/[^'")]+)\1\)/g)]
        .map((match) => match[2])
        .filter((url) => !url.startsWith(fontUrlTo));
    assert.equal(unresolved.length, 0, `Unresolved relative font URLs: ${unresolved.join(', ')}`);
    return rebased;
};

export const renderAppArtifact = ({ bodies, appConfig, repoRoot }) => {
    const chunks = [];
    for (const [file, body] of bodies) {
        chunks.push(`/* Inlined source import: @import "./${file}" */`, rebaseFontUrls(body.trim(), appConfig));
    }
    const overrides = readAppOverrides(resolve(repoRoot, appConfig.overridesSource), appConfig.overridesSource);
    return [
        '/* GENERATED FILE. Run `pnpm tokens:generate`; do not edit. */',
        '/* DTCG source: packages/gov-ui-kit/design-system/tokens/source */',
        '/* Primitive CSS imports are flattened here; utilities and font faces remain CSS. */',
        '/* CSS-only unsupported values remain from GovKit, including --radius-none: none. */',
        chunks.join('\n\n'),
        `/* App runtime overrides from ${appConfig.overridesSource.replace(/^apps\/app\//, '')} */`,
        overrides,
        '',
    ].join('\n\n');
};
