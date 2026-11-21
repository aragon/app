// Report of the typography layer (`pnpm tokens:report`): every exception with its pattern, its role, its Today bundle
// against the role's bundle, the places that use it (a scan of the source of the kit, the app, the assistant chat and
// the help center) and its resolution, plus how often each role and modifier is used. Writes nothing.

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { aliasTarget, EXT, isAlias } from './dtcg.mjs';

const SCAN = ['packages/gov-ui-kit/src', 'apps/app/src', 'packages/assistant-chat/src', 'apps/docs/src'];
const SKIP = /\.(test|spec)\.tsx?$|\.d\.ts$|typographyStyles\.ts$|typography\.css$/;

const files = (dir, out = []) => {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            if (name !== 'node_modules') {
                files(path, out);
            }
        } else if (/\.(tsx?|css)$/.test(name) && !SKIP.test(path)) {
            out.push(path);
        }
    }
    return out;
};

// Places of every style: files that use `type-<style>` (or pass the style to a `typeRole` prop), with the count.
const scanPlaces = (repoRoot, names) => {
    const places = new Map(names.map((name) => [name, new Map()]));
    for (const root of SCAN) {
        for (const file of files(resolve(repoRoot, root))) {
            const text = readFileSync(file, 'utf8');
            const rel = relative(repoRoot, file);
            const add = (name) => {
                const perFile = places.get(name);
                if (perFile != null) {
                    perFile.set(rel, (perFile.get(rel) ?? 0) + 1);
                }
            };
            for (const [, name] of text.matchAll(
                /(?<![\w-])type-([a-z0-9]+(?:-[a-z0-9]+)*(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?)(?![\w-])/g,
            )) {
                add(name);
            }
            for (const [, name] of text.matchAll(/typeRole(?:=|: )\{?["'`]([\w-]+)["'`]/g)) {
                add(name);
            }
            for (const [, a, b] of text.matchAll(/typeRole=\{[^}]*\?\s*'([\w-]+)'\s*:\s*'([\w-]+)'\s*\}/g)) {
                add(a);
                add(b);
            }
        }
    }
    return places;
};

export const typographyReport = ({ typography, primitives, repoRoot }) => {
    const { styles, roleNames, exceptionNames, today } = typography;
    const value = (path) => {
        let entry = primitives.get(path) ?? today.get(path);
        while (isAlias(entry.value)) {
            entry = primitives.get(aliasTarget(entry.value)) ?? today.get(aliasTarget(entry.value));
        }
        return entry.value;
    };
    const part = (v) => (isAlias(v) ? value(aliasTarget(v)) : v);
    const bundle = (composite) => {
        const size = part(composite.fontSize);
        const px = size.unit === 'rem' ? size.value * 16 : size.value;
        const lh = Math.round(px * part(composite.lineHeight) * 100) / 100;
        const spacing = part(composite.letterSpacing);
        return `${px}/${lh}/${part(composite.fontWeight)}${spacing.value === 0 ? '' : ` ls ${spacing.value}${spacing.unit}`}`;
    };
    const steps = (kind, name) => {
        const [base, md] = ['base', 'md'].map((bp) => bundle(today.get(`type.${kind}.${name}.${bp}`).value));
        return base === md ? base : `${base} → ${md}`;
    };
    const modifiers = ['strong', 'mono', 'numeric'];
    const places = scanPlaces(repoRoot, [...styles.keys(), ...modifiers]);
    const lines = [];
    const count = (name) => [...places.get(name).values()].reduce((a, b) => a + b, 0);
    lines.push(
        `Typography: ${roleNames.length} roles, ${exceptionNames.length} exceptions, ${modifiers.length} modifiers.`,
    );
    lines.push(
        '',
        '| Role | Bundle (phone → desktop, px size/line height/weight) | Uses | Files |',
        '| --- | --- | --- | --- |',
    );
    for (const name of roleNames) {
        lines.push(`| ${name} | ${steps('role', name)} | ${count(name)} | ${places.get(name).size} |`);
    }
    for (const name of modifiers) {
        lines.push(`| ${name} (modifier) | — | ${count(name)} | ${places.get(name).size} |`);
    }
    lines.push(
        '',
        '| Exception | Role | Pattern | Today | Role bundle | Uses | Places | Resolution |',
        '| --- | --- | --- | --- | --- | --- | --- | --- |',
    );
    const unused = [];
    for (const name of exceptionNames) {
        const style = styles.get(name);
        const meta = today.get(`type.exception.${name}.base`);
        const group = typography.groups?.get(name);
        const description = group?.description ?? meta.description ?? '';
        const resolution = group?.extensions?.resolution ?? '';
        const perFile = places.get(name);
        if (perFile.size === 0) {
            unused.push(name);
        }
        const where = [...perFile.keys()].map((file) => `\`${file.replace(/^.*?\/src\//, '')}\``).join(', ');
        lines.push(
            `| ${name} | ${style.role} | ${description} | ${steps('exception', name)} | ${steps('role', style.role)} | ${count(name)} | ${where} | ${resolution ?? ''} |`,
        );
    }
    lines.push('', `Exceptions without a place: ${unused.length === 0 ? 'none' : unused.join(', ')}`);
    void EXT;
    return { text: lines.join('\n'), unused };
};
