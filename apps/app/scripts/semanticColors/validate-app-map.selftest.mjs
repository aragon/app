#!/usr/bin/env node
// Proves that validate-app-map.mjs catches deliberate mistakes: each case copies the map, breaks one thing, runs the
// validator on the copy and expects it to fail with a specific message. Run before applying the map (the cases use
// the line-by-line state). Usage: node scripts/semanticColors/validate-app-map.selftest.mjs

import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const mapPath = resolve(
    here,
    '../../design-system/semantic-colors.app-map.json',
);
const original = JSON.parse(readFileSync(mapPath, 'utf8'));
if (original.applied != null) {
    console.error(
        'validate-app-map.selftest: the map is applied; the cases need the unapplied map (git stash or checkout)',
    );
    process.exit(1);
}
const find = (map, file, test) => map.files[file].find(test);
const F = {
    nav: 'apps/app/src/modules/application/components/navigations/navigationSidebarAccount/navigationSidebarAccount.tsx',
    explore:
        'apps/app/src/modules/explore/components/exploreNav/exploreNav.tsx',
    attachment:
        'packages/assistant-chat/src/components/attachment/attachment.tsx',
    pageHeader: 'apps/app/src/shared/components/page/pageHeader/pageHeader.tsx',
    debug: 'apps/app/src/modules/application/components/debugPanel/debugPanel.tsx',
    status: 'apps/app/src/shared/components/transactionStatus/transactionStatusContainer/transactionStatusContainer.tsx',
    docs: 'apps/docs/src/app/globals.css',
};
const cases = [
    {
        name: 'a replacement with another value (text 800 → secondary 500)',
        expect: /compiled rules differ/,
        mutate: (m) => {
            find(m, F.nav, (e) => e.old === 'text-neutral-800').new =
                'text-surface-secondary';
        },
    },
    {
        name: 'a dropped variant (hover:border → border)',
        expect: /does not keep the variant prefix/,
        mutate: (m) => {
            find(m, F.nav, (e) => e.old === 'hover:border-neutral-200').new =
                'border-surface-hover';
        },
    },
    {
        name: 'an opacity-modified class replaced by the full colour',
        expect: /compiled rules differ/,
        mutate: (m) => {
            const e = find(m, F.attachment, (x) => x.old === 'bg-neutral-0/60');
            Object.assign(e, { new: 'bg-surface-primary' });
        },
    },
    {
        name: 'a shadow of another size (sm → default)',
        expect: /compiled rules differ/,
        mutate: (m) => {
            find(m, F.status, (e) => e.old === 'shadow-neutral').new =
                'shadow-surface-sm';
        },
    },
    {
        name: 'a focus ring in another colour',
        expect: /compiled rules differ/,
        mutate: (m) => {
            find(m, F.nav, (e) => e.old === 'focus-ring-primary').new =
                'focus-ring ring-critical-focus';
        },
    },
    {
        name: 'a gradient stop of another token (page grey → white)',
        expect: /compiled rules differ/,
        mutate: (m) => {
            find(m, F.pageHeader, (e) => e.old === 'to-neutral-50').new =
                'to-gradient-surface-secondary';
        },
    },
    {
        name: 'a single side instead of every side (border → border-l)',
        expect: /compiled rules differ/,
        mutate: (m) => {
            find(m, F.debug, (e) => e.old === 'border-neutral-100').new =
                'border-l-surface-secondary';
        },
    },
    {
        name: 'a class missing from the map',
        expect: /occurrence #\d+ is .* in source but .* in map/,
        mutate: (m) => {
            m.files[F.nav].splice(1, 1);
        },
    },
    {
        name: 'a conflict whose token already holds the colour',
        expect: /listed as a conflict on .* but the token compiles to the same value/,
        mutate: (m) => {
            Object.assign(
                find(m, F.debug, (e) => e.old === 'bg-neutral-0'),
                {
                    new: null,
                    token: 'bg/surface/primary',
                    reason: 'conflict: bg/surface/primary has default value `neutral-0`, today `neutral-0`',
                },
            );
        },
    },
    {
        name: 'an override passed into another component that would lose by name order',
        expect: /ordering across components: .*exploreNav/,
        mutate: (m) => {
            const e = find(m, F.explore, (x) => x.old === 'bg-primary-400');
            delete e.protect;
            e.new = 'bg-brand-solid';
        },
    },
    {
        name: 'two classes of one element whose winner flips (reviewed pair removed)',
        expect: /ordering may change on one element: .*autocompleteInputItem/,
        mutate: (m) => {
            m.orderingReviewed = m.orderingReviewed.filter(
                (r) => !r.file.endsWith('autocompleteInputItem.tsx'),
            );
        },
    },
    {
        name: 'a colour literal replaced by a variable with another value',
        expect: /nonClassReferences: .* not the same default value/,
        mutate: (m) => {
            m.nonClassReferences.find(
                (r) => r.new === 'var(--guk-bg-accent-solid)',
            ).new = 'var(--guk-bg-accent-hover)';
        },
    },
    {
        name: 'a CSS @apply class with another value',
        expect: /globals\.css:\d+ text-neutral-800 .*compiled rules differ/,
        mutate: (m) => {
            find(m, F.docs, (e) => e.old === 'text-neutral-800').new =
                'text-surface-secondary';
        },
    },
];

const dir = mkdtempSync(join(tmpdir(), 'app-map-selftest-'));
let failed = 0;
try {
    for (const c of cases) {
        const copy = structuredClone(original);
        c.mutate(copy);
        const path = join(dir, 'map.json');
        writeFileSync(path, JSON.stringify(copy));
        const run = spawnSync(
            process.execPath,
            [resolve(here, 'validate-app-map.mjs'), '--map', path],
            {
                encoding: 'utf8',
            },
        );
        const caught = run.status === 1 && c.expect.test(run.stderr);
        failed += caught ? 0 : 1;
        console.log(`${caught ? 'caught' : 'MISSED'}  ${c.name}`);
        if (!caught) {
            console.log(run.stdout + run.stderr);
        }
    }
} finally {
    rmSync(dir, { recursive: true, force: true });
}
console.log(
    `validate-app-map.selftest: ${cases.length - failed} of ${cases.length} deliberate errors caught`,
);
process.exit(failed === 0 ? 0 : 1);
