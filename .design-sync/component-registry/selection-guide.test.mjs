import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { buildGuide, checkGuide, validateGuide } from './selection-guide.mjs';

const REVIEW_QUESTION_PREFIX = 'Review question (maintainer discussion):';

// Small in-memory source registry covering both UI kinds and utility, plus a
// non-guide kind to prove filtering. sha256/fingerprint checks always read the
// real registry.json, so build+validate stay consistent regardless of these ids.
function makeRegistry() {
    const component = (id, name, kind, intent, extra = {}) => ({
        id,
        name,
        kind,
        exportNames: [name],
        exports: [{ entrypoint: '.', name }],
        source: { repository: 'kit', path: `src/${name}.tsx`, line: 1 },
        stories: [
            { repository: 'kit', path: `src/${name}.stories.tsx`, line: 1 },
        ],
        intent: {
            review: { state: 'unreviewed', by: null, at: null },
            ...intent,
        },
        ...extra,
    });
    return {
        schemaVersion: '1.0.0',
        components: [
            component(
                'kit:Button',
                'Button',
                'component',
                {
                    description: 'A button',
                    useWhen: ['clicking'],
                    constraints: [
                        'avoid double submit',
                        `${REVIEW_QUESTION_PREFIX} should this be split?`,
                    ],
                    alternatives: [{ id: 'kit:Link', useWhen: 'navigation' }],
                    keyProps: [
                        { name: 'variant', contract: 'primary|secondary' },
                    ],
                    composition: ['kit:Card', 'wrap in a form'],
                    related: [
                        {
                            name: 'Card',
                            distinction: 'Container for this action',
                        },
                    ],
                },
                {
                    usage: {
                        refs: [
                            {
                                repository: 'app',
                                path: 'src/app.tsx',
                                line: 5,
                                usageType: 'production',
                            },
                        ],
                    },
                },
            ),
            component('kit:Link', 'Link', 'component', {
                description: 'A link',
                useWhen: [],
                constraints: [],
                alternatives: [],
                keyProps: [],
                composition: [],
                review: {
                    state: 'human-reviewed',
                    by: 'maintainer',
                    at: '2026-01-01T00:00:00Z',
                },
            }),
            component('kit:Card', 'Card', 'compound', {
                description: 'Compound container',
                useWhen: ['grouping content'],
                constraints: [],
                composition: ['Compose Card.Root with Card.Content.'],
            }),
            component('kit:formatUtils', 'formatUtils', 'utility', {
                description: 'Formatting helpers',
                useWhen: ['formatting values'],
                constraints: [],
                methods: [{ name: 'toWei', contract: 'string -> bigint' }],
                composition: [],
            }),
            component('kit:SomeEnum', 'SomeEnum', 'non-component', {
                description: 'not eligible',
            }),
        ],
    };
}

function entryById(guide, id) {
    return guide.entries.find((entry) => entry.id === id);
}

test('preserves registry-curated utility methods and UI keyProps', () => {
    const registry = makeRegistry();
    const guide = buildGuide(registry);
    assert.deepEqual(entryById(guide, 'kit:formatUtils').methods, [
        { name: 'toWei', contract: 'string -> bigint' },
    ]);
    assert.deepEqual(entryById(guide, 'kit:Button').keyProps, [
        { name: 'variant', contract: 'primary|secondary' },
    ]);
});

test('projects kind-appropriate fields for UI and utility entries', () => {
    const registry = makeRegistry();
    const guide = buildGuide(registry);
    const ui = entryById(guide, 'kit:Button');
    assert.ok(Array.isArray(ui.alternatives) && Array.isArray(ui.keyProps));
    assert.ok(!('methods' in ui));
    const utility = entryById(guide, 'kit:formatUtils');
    assert.ok(Array.isArray(utility.methods));
    assert.ok(!('keyProps' in utility) && !('alternatives' in utility));
});

test('includes every eligible id regardless of review state', () => {
    const registry = makeRegistry();
    const guide = buildGuide(registry);
    const ids = guide.entries.map((entry) => entry.id).sort();
    assert.deepEqual(ids, [
        'kit:Button',
        'kit:Card',
        'kit:Link',
        'kit:formatUtils',
    ]);
    assert.ok(guide.entries.every((entry) => !('review' in entry)));
    validateGuide(guide, registry);
});

test('excludes maintainer discussion questions from the projection', () => {
    const registry = makeRegistry();
    const guide = buildGuide(registry);
    assert.deepEqual(entryById(guide, 'kit:Button').constraints, [
        'avoid double submit',
    ]);
    assert.ok(!JSON.stringify(guide).includes(REVIEW_QUESTION_PREFIX));
});

test('does not convert composition records into alternatives', () => {
    const registry = makeRegistry();
    const guide = buildGuide(registry);
    const ui = entryById(guide, 'kit:Button');
    assert.deepEqual(ui.composition, ['kit:Card', 'wrap in a form']);
    assert.deepEqual(
        ui.alternatives.map((alternative) => alternative.id),
        ['kit:Link'],
    );
});

test('rejects a discussion question that leaks into the guide', () => {
    const registry = makeRegistry();
    const broken = structuredClone(buildGuide(registry));
    broken.entries[0].constraints.push(`${REVIEW_QUESTION_PREFIX} nope`);
    assert.throws(
        () => validateGuide(broken, registry),
        /must not include maintainer review-question prose/,
    );
});

test('rejects an alternative id that is not a registry entry', () => {
    const registry = makeRegistry();
    const broken = structuredClone(buildGuide(registry));
    entryById(broken, 'kit:Button').alternatives.push({
        id: 'kit:Missing',
        useWhen: 'bad',
    });
    assert.throws(
        () => validateGuide(broken, registry),
        /alternative id is not in guide/,
    );
});

test('rejects a stale source registry fingerprint', () => {
    const registry = makeRegistry();
    const broken = structuredClone(buildGuide(registry));
    broken.metadata.sourceRegistry.sha256 = 'stale';
    assert.throws(
        () => validateGuide(broken, registry),
        /source registry fingerprint is stale/,
    );
});

test('rejects a guide missing an eligible source entry', () => {
    const registry = makeRegistry();
    const broken = structuredClone(buildGuide(registry));
    broken.entries.pop();
    assert.throws(
        () => validateGuide(broken, registry),
        /id set does not match source registry id set/,
    );
});

test('rejects UI-only keyProps on a utility entry', () => {
    const registry = makeRegistry();
    const broken = structuredClone(buildGuide(registry));
    entryById(broken, 'kit:formatUtils').keyProps = [];
    assert.throws(
        () => validateGuide(broken, registry),
        /utility must not carry UI-only fields/,
    );
});

test('checkGuide accepts freshly generated output and rejects edits', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'selection-guide-'));
    const guidePath = path.join(directory, 'selection-guide.json');
    try {
        const guide = buildGuide();
        fs.writeFileSync(guidePath, `${JSON.stringify(guide, null, 4)}\n`);
        assert.deepEqual(checkGuide(guidePath), guide);

        const edited = structuredClone(guide);
        edited.entries[0].description = 'hand-edited drift';
        fs.writeFileSync(guidePath, `${JSON.stringify(edited, null, 4)}\n`);
        assert.throws(() => checkGuide(guidePath), /Selection guide is stale/);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});
