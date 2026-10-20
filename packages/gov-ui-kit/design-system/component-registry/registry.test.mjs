import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { buildRegistry, extractExports, validateRegistry } from './registry.mjs';

const componentDirectory = path.dirname(new URL(import.meta.url).pathname);
const kitRoot = path.resolve(process.env.GOVKIT_KIT_ROOT || path.join(componentDirectory, '../..'));
if (!existsSync(path.join(kitRoot, 'package.json'))) {
    throw new Error(`GovKit source checkout not found at ${kitRoot}; set GOVKIT_KIT_ROOT`);
}

test('distinguishes nested compounds from callable contexts and enums', () => {
    const extracted = extractExports(kitRoot);
    const proposalVoting = extracted.records.find((record) => record.name === 'ProposalVoting');
    const progress = proposalVoting?.members.find((member) => member.name === 'ProposalVoting.Progress');
    assert.equal(progress?.id, 'govkit:ProposalVotingProgress');
    assert.equal(extracted.records.find((record) => record.name === 'TabsContext')?.kind, 'non-component');
    assert.equal(extracted.records.find((record) => record.name === 'IconType')?.kind, 'non-component');
});

test('reads JSDoc usage notes, enum values and string-union values', () => {
    const { records } = extractExports(kitRoot);
    const byName = (name) => records.find((record) => record.name === name);
    const button = byName('Button').usageNotes;
    assert.equal(button.length, 2);
    assert.match(button[0], /spinner — the label does not disappear\.$/u);
    // In a JSDoc that also has a description and @param tags, only the list is taken.
    const collapsible = byName('Collapsible').usageNotes;
    assert.equal(collapsible.length, 2);
    assert.match(collapsible[1], /^With `showOverlay`.*native button\.$/u);
    assert.ok(byName('IconType').values.includes('PLUS'));
    assert.ok(byName('IllustrationObjectType').values.includes("'ACTION'"));
    assert.equal(byName('Card').values, undefined);
});

test('refreshes isolated kit registry while preserving intent and marking stale evidence', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'govkit-registry-'));
    const registryPath = path.join(directory, 'registry.json');
    const options = { kitRoot, registryPath };
    try {
        const initial = buildRegistry({ ...options, preserveCurated: false });
        const button = initial.components.find((record) => record.name === 'Button');
        assert.ok(button?.source);
        assert.equal(button.source.repository, 'kit');
        const staleSha256 = `${button.source.sha256.slice(0, -1)}${button.source.sha256.endsWith('0') ? '1' : '0'}`;
        const curated = structuredClone(initial);
        const curatedButton = curated.components.find((record) => record.name === 'Button');
        curatedButton.intent.description = 'Preserved fixture intent';
        curatedButton.intent.evidence = [{ ...curatedButton.source, sha256: staleSha256 }];
        curatedButton.intent.stale = false;
        await writeFile(registryPath, JSON.stringify(curated));

        const refreshed = buildRegistry(options);
        const refreshedButton = refreshed.components.find((record) => record.name === 'Button');
        assert.equal(refreshedButton.intent.description, 'Preserved fixture intent');
        assert.equal(refreshedButton.intent.evidence[0].sha256, staleSha256);
        assert.equal(refreshedButton.intent.evidenceStatus[0].expectedSha256, staleSha256);
        assert.equal(refreshedButton.intent.evidenceStatus[0].status, 'changed');
        assert.notEqual(refreshedButton.intent.evidenceStatus[0].actualSha256, staleSha256);
        assert.equal(refreshedButton.intent.stale, true);

        validateRegistry(refreshed, options);
        const malformed = structuredClone(initial);
        malformed.components[0].unexpected = true;
        assert.throws(() => validateRegistry(malformed, options), /Schema validation failed/);
        const duplicate = structuredClone(initial);
        duplicate.components[1].id = duplicate.components[0].id;
        assert.throws(() => validateRegistry(duplicate, options), /Duplicate component id/);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
});

test('rejects app evidence references', () => {
    const registry = buildRegistry({ kitRoot, preserveCurated: false });
    const broken = structuredClone(registry);
    const button = broken.components.find((record) => record.name === 'Button');
    button.intent.evidence = [{ ...button.source, repository: 'app' }];
    assert.throws(() => validateRegistry(broken, { kitRoot }), /Schema validation failed/);
});
