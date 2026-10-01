#!/usr/bin/env node
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REGISTRY_DIR = path.dirname(SCRIPT_PATH);
const REGISTRY_PATH = path.join(REGISTRY_DIR, 'registry.json');
const GUIDE_PATH = path.join(REGISTRY_DIR, 'selection-guide.json');
const PACKAGE_NAME = '@aragon/gov-ui-kit';
const UI_KINDS = new Set(['component', 'compound']);
const GUIDE_KINDS = new Set(['component', 'compound', 'utility']);
const REVIEW_QUESTION_PREFIX = 'Review question (maintainer discussion):';

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
    fs.writeFileSync(filePath, serialize(value));
}

function serialize(value) {
    return `${JSON.stringify(value, null, 4)}\n`;
}

function sha256(filePath) {
    return createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function refString(reference) {
    if (!reference) {
        return null;
    }
    return `${reference.repository}:${reference.path}:${reference.line}`;
}

function asStrings(values) {
    return (Array.isArray(values) ? values : []).filter(
        (value) => typeof value === 'string' && value.length > 0,
    );
}

function firstExportName(component) {
    return (
        component.exports?.find((entry) => entry.entrypoint === '.')?.name ??
        component.exportNames?.[0] ??
        component.name
    );
}

function buildGuide(registry = readJson(REGISTRY_PATH)) {
    const sourceEntries = registry.components
        .filter((component) => GUIDE_KINDS.has(component.kind))
        .sort((a, b) => a.id.localeCompare(b.id));
    const uiEntryCount = sourceEntries.filter((component) =>
        UI_KINDS.has(component.kind),
    ).length;
    const utilityEntryCount = sourceEntries.filter(
        (component) => component.kind === 'utility',
    ).length;

    const entries = sourceEntries.map((component) => {
        const constraints = asStrings(component.intent?.constraints).filter(
            (constraint) => !constraint.startsWith(REVIEW_QUESTION_PREFIX),
        );
        const appReferences = [
            ...(component.intent?.evidence ?? []).filter(
                (reference) => reference.repository === 'app',
            ),
            ...(component.usage?.refs ?? []).filter(
                (reference) =>
                    reference.repository === 'app' &&
                    reference.usageType === 'production',
            ),
        ];
        const appPaths = new Set();
        const appExamples = [];
        for (const reference of appReferences) {
            if (appPaths.has(reference.path)) {
                continue;
            }
            appPaths.add(reference.path);
            appExamples.push(refString(reference));
            if (appExamples.length === 3) {
                break;
            }
        }
        const entry = {
            id: component.id,
            kind: component.kind,
            import: { package: PACKAGE_NAME, name: firstExportName(component) },
            description: component.intent?.description ?? null,
            useWhen: asStrings(component.intent?.useWhen),
        };

        if (UI_KINDS.has(component.kind)) {
            entry.alternatives = Array.isArray(component.intent?.alternatives)
                ? component.intent.alternatives
                : [];
            entry.keyProps = Array.isArray(component.intent?.keyProps)
                ? component.intent.keyProps
                : [];
        } else {
            entry.methods = Array.isArray(component.intent?.methods)
                ? component.intent.methods
                : [];
        }

        entry.constraints = constraints;
        entry.composition = asStrings(component.intent?.composition);
        entry.references = {
            source: refString(component.source),
            stories: (component.stories ?? []).map(refString),
            appExamples,
        };
        return entry;
    });

    return {
        schemaVersion: '1.1.0',
        metadata: {
            package: PACKAGE_NAME,
            sourceRegistry: {
                path: 'registry.json',
                schemaVersion: registry.schemaVersion,
                sha256: sha256(REGISTRY_PATH),
                totalRecords: registry.components.length,
                entryCount: sourceEntries.length,
                uiEntryCount,
                utilityEntryCount,
                sourceDerivedStatus:
                    'All eligible UI and utility exports are included from the source registry; no human approval is inferred.',
            },
            generation: {
                tool: 'selection-guide.mjs',
                deterministic: true,
                enrichment:
                    'Guide projects optional intent.keyProps, intent.alternatives, intent.composition and intent.methods fields; registry intent remains authoritative.',
            },
        },
        entries,
    };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

function assertArray(value, message) {
    assert(Array.isArray(value), message);
}

function validatePortableRef(reference, message) {
    assert(
        reference === null || /^(app|kit|consumed):[^:]+:\d+$/u.test(reference),
        message,
    );
}

function validateGuide(guide, registry = readJson(REGISTRY_PATH)) {
    assert(guide && typeof guide === 'object', 'Guide must be an object');
    assert(guide.schemaVersion === '1.1.0', 'Unexpected guide schemaVersion');
    assertArray(guide.entries, 'Guide entries must be an array');

    const sourceEntries = registry.components.filter((component) =>
        GUIDE_KINDS.has(component.kind),
    );
    const uiEntries = sourceEntries.filter((component) =>
        UI_KINDS.has(component.kind),
    );
    const utilityEntries = sourceEntries.filter(
        (component) => component.kind === 'utility',
    );
    const registryIds = new Set(sourceEntries.map((component) => component.id));
    const componentsById = new Map(
        sourceEntries.map((component) => [component.id, component]),
    );
    const entryIds = new Set();
    const serialized = JSON.stringify(guide);
    assert(
        !serialized.includes(REVIEW_QUESTION_PREFIX),
        'Guide must not include maintainer review-question prose',
    );

    assert(
        guide.metadata?.sourceRegistry?.sha256 === sha256(REGISTRY_PATH),
        'Guide source registry fingerprint is stale',
    );
    assert(
        guide.metadata.sourceRegistry.entryCount === sourceEntries.length,
        'Guide metadata entry count is stale',
    );
    assert(
        guide.metadata.sourceRegistry.uiEntryCount === uiEntries.length,
        'Guide metadata UI count is stale',
    );
    assert(
        guide.metadata.sourceRegistry.utilityEntryCount ===
            utilityEntries.length,
        'Guide metadata utility count is stale',
    );
    assert(
        guide.metadata.sourceRegistry.sourceDerivedStatus &&
            typeof guide.metadata.sourceRegistry.sourceDerivedStatus ===
                'string',
        'Guide must state source-derived status once in metadata',
    );

    const sortedIds = [...guide.entries]
        .map((entry) => entry.id)
        .sort((a, b) => a.localeCompare(b));
    assert(
        guide.entries.every((entry, index) => entry.id === sortedIds[index]),
        'Guide entries must be sorted by id',
    );

    for (const entry of guide.entries) {
        assert(
            typeof entry.id === 'string' && registryIds.has(entry.id),
            `Unknown guide entry id: ${entry.id}`,
        );
        assert(
            !entryIds.has(entry.id),
            `Duplicate guide entry id: ${entry.id}`,
        );
        entryIds.add(entry.id);
        assert(
            !Object.keys(entry).some((key) => /review/iu.test(key)),
            `${entry.id} must not carry per-entry review fields`,
        );

        const component = componentsById.get(entry.id);
        assert(
            entry.kind === component.kind,
            `${entry.id} kind does not match registry`,
        );
        assert(
            entry.import?.package === PACKAGE_NAME,
            `${entry.id} import package must be ${PACKAGE_NAME}`,
        );
        assert(
            component.exportNames.includes(entry.import?.name),
            `${entry.id} import name does not resolve to registry export`,
        );
        assert(
            entry.description === null || typeof entry.description === 'string',
            `${entry.id} description must be string/null`,
        );
        for (const field of ['useWhen', 'constraints', 'composition']) {
            assertArray(entry[field], `${entry.id}.${field} must be an array`);
            assert(
                entry[field].every((item) => typeof item === 'string'),
                `${entry.id}.${field} must contain strings`,
            );
        }

        if (UI_KINDS.has(entry.kind)) {
            assertArray(
                entry.alternatives,
                `${entry.id}.alternatives must be an array`,
            );
            assertArray(
                entry.keyProps,
                `${entry.id}.keyProps must be an array`,
            );
            assert(
                !('methods' in entry),
                `${entry.id} UI entry must not carry methods`,
            );
            for (const alternative of entry.alternatives) {
                assert(
                    registryIds.has(alternative.id),
                    `${entry.id} alternative id is not in guide: ${alternative.id}`,
                );
                assert(
                    UI_KINDS.has(componentsById.get(alternative.id).kind),
                    `${entry.id} alternative must target UI entry`,
                );
                assert(
                    alternative.id !== entry.id,
                    `${entry.id} alternative points to itself`,
                );
                assert(
                    typeof alternative.useWhen === 'string',
                    `${entry.id} alternative useWhen must be a string`,
                );
            }
            for (const prop of entry.keyProps) {
                assert(
                    typeof prop.name === 'string' &&
                        typeof prop.contract === 'string',
                    `${entry.id}.keyProps must contain {name, contract}`,
                );
            }
        } else {
            assertArray(entry.methods, `${entry.id}.methods must be an array`);
            assert(
                !('keyProps' in entry) && !('alternatives' in entry),
                `${entry.id} utility must not carry UI-only fields`,
            );
            for (const method of entry.methods) {
                assert(
                    typeof method.name === 'string' &&
                        typeof method.contract === 'string',
                    `${entry.id}.methods must contain {name, contract}`,
                );
            }
        }

        for (const constraint of entry.constraints) {
            assert(
                !constraint.startsWith(REVIEW_QUESTION_PREFIX),
                `${entry.id} includes a review-question constraint`,
            );
        }
        validatePortableRef(
            entry.references?.source,
            `${entry.id}.references.source is not portable`,
        );
        assertArray(
            entry.references?.stories,
            `${entry.id}.references.stories must be an array`,
        );
        assertArray(
            entry.references?.appExamples,
            `${entry.id}.references.appExamples must be an array`,
        );
        for (const reference of [
            ...entry.references.stories,
            ...entry.references.appExamples,
        ]) {
            validatePortableRef(
                reference,
                `${entry.id} reference is not portable: ${reference}`,
            );
        }
    }

    assert(
        entryIds.size === registryIds.size,
        'Guide id set does not match source registry id set',
    );
    for (const id of registryIds) {
        assert(entryIds.has(id), `Missing guide entry: ${id}`);
    }

    return true;
}

function checkGuide(filePath = GUIDE_PATH) {
    const registry = readJson(REGISTRY_PATH);
    const guide = readJson(filePath);
    validateGuide(guide, registry);
    const expected = serialize(buildGuide(registry));
    const actual = fs.readFileSync(filePath, 'utf8');
    assert(
        actual === expected,
        `Selection guide is stale; run node ${path.relative(process.cwd(), SCRIPT_PATH)}`,
    );
    return guide;
}

function printEntries(ids) {
    const guide = checkGuide();
    const byId = new Map(guide.entries.map((entry) => [entry.id, entry]));
    const selected = ids.map((id) => byId.get(id)).filter(Boolean);
    process.stdout.write(serialize(selected));
}

function main(argv = process.argv.slice(2)) {
    const command = argv[0] || 'generate';
    if (command === 'generate') {
        const guide = buildGuide();
        validateGuide(guide);
        writeJson(GUIDE_PATH, guide);
        process.stdout.write(
            `Wrote ${guide.entries.length} selection-guide entries to ${path.relative(process.cwd(), GUIDE_PATH)}\n`,
        );
        return;
    }
    if (command === 'check') {
        const guide = checkGuide(argv[1] ? path.resolve(argv[1]) : GUIDE_PATH);
        process.stdout.write(
            `Selection guide is current (${guide.metadata.sourceRegistry.uiEntryCount} UI + ${guide.metadata.sourceRegistry.utilityEntryCount} utility entries)\n`,
        );
        return;
    }
    if (command === 'print') {
        printEntries(argv.slice(1));
        return;
    }
    throw new Error(
        `Unknown command ${command}; expected generate, check or print`,
    );
}

export { buildGuide, checkGuide, main, validateGuide };

if (path.resolve(process.argv[1] || '') === path.resolve(SCRIPT_PATH)) {
    try {
        main();
    } catch (error) {
        process.stderr.write(
            `${error instanceof Error ? error.message : String(error)}\n`,
        );
        process.exitCode = 1;
    }
}
