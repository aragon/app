import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import test from 'node:test';
import { differences, extractRows, lockedViem, renderPage, snapshot, table } from './supported-chains.mjs';

const app = resolve(process.env.SUPPORTED_CHAINS_APP ?? '../app');
const require = createRequire(resolve(app, 'apps/app/package.json'));
const dependencies = { ts: require('typescript'), yaml: require('yaml') };
const enumSource = "export enum Network { MAIN = 'main', TEST = 'test' }";
const chains = {
    main: { id: 1, name: 'Dependency name', blockExplorers: { default: { name: 'Explorer', url: 'https://example.com' } } },
    test: { id: 2, name: 'Test chain', testnet: true },
    unrelated: { id: 3, name: 'Not app-supported' },
};
const source = `import { main as production, test } from 'viem/chains';
import { Network } from '@/shared/api/daoService';
export const networkDefinitions = {
  [Network.TEST]: { ...test, tenderlySupport: false, disabled: true },
  [Network.MAIN]: { ...production, name: 'App name', tenderlySupport: true, beta: true },
};`;
const extract = (text = source) => extractRows(text, enumSource, chains, dependencies.ts);
const document = `---
type: reference
status: draft
source: Owner provenance
chain_source: old
chain_release: old
chain_viem: old
---
# Supported chains
Keep this authored paragraph.
<!-- supported-chains:start -->
old rows
<!-- supported-chains:end -->
Keep these related links.
`;
const data = () => ({ release: '@aragon/app@1.38.0', commit: 'a'.repeat(40), viem: '2.55.13', rows: extract() });

test('app membership and overrides win; disabled chains remain with separate availability', () => {
    const rows = extract();
    assert.equal(rows.length, 2);
    assert.equal(rows[0].name, 'App name');
    assert.equal(rows[1].testnet, true);
    assert.equal(rows[1].disabled, true);
    assert.match(table(rows), /Available \(beta\)/);
    assert.match(table(rows), /Testnet \| Unavailable \| Unavailable/);
    assert.doesNotMatch(table(rows), /Not app-supported/);
});

test('comparison reports additions, removals, and changed classification or availability', () => {
    const before = extract();
    const changed = { ...before[0], name: 'Renamed', testnet: true, simulation: false };
    const added = { ...before[1], network: 'new', id: 4 };
    const delta = differences(before, [changed, added]);
    assert.deepEqual(delta.added, [added]);
    assert.deepEqual(delta.removed, [before[1]]);
    assert.deepEqual(delta.changed, [{ before: before[0], after: changed }]);
    assert.deepEqual(differences(before, before), { added: [], removed: [], changed: [] });
});

test('malformed, dynamic, ambiguous, and incomplete data fail instead of emitting partial rows', () => {
    for (const invalid of [
        source.replace("...production", '...unknownChain'),
        source.replace('tenderlySupport: true', 'tenderlySupport: fetchFlag()'),
        source.replace('tenderlySupport: true,', ''),
        source.replace('...test', '...test, id: 1'),
        source.replace('disabled: true', "disabled: 'false'"),
        source.replace('[Network.TEST]', '[Network.MAIN]'),
        source + '\nnetworkDefinitions[Network.MAIN].disabled = true;',
        source.replace('...production', '...'),
    ]) assert.throws(() => extract(invalid));
    assert.throws(() => extractRows('export const networkDefinitions = {};', enumSource, chains, dependencies.ts));
});

test('lock resolution uses the app importer, not another workspace or a version range', () => {
    const lock = 'importers:\n  apps/app:\n    dependencies:\n      viem:\n        version: 2.55.13(typescript@5.9.3)\n  other:\n    dependencies:\n      viem:\n        version: 3.0.0\n';
    assert.equal(lockedViem(lock, dependencies.yaml), '2.55.13');
    assert.throws(() => lockedViem(lock.replace('2.55.13(', '^2.55.13('), dependencies.yaml));
    assert.throws(() => lockedViem('importers: {}', dependencies.yaml));
});

test('regeneration is idempotent and preserves authored content, status, and line endings', () => {
    for (const input of [document, document.replaceAll('\n', '\r\n')]) {
        const output = renderPage(input, data());
        assert.equal(renderPage(output, data()), output);
        assert.match(output, /status: draft/);
        assert.match(output, /source: Owner provenance/);
        assert.match(output, /Keep this authored paragraph/);
        assert.match(output, /Keep these related links/);
        assert.equal(output.includes('\r\n'), input.includes('\r\n'));
        assert.doesNotMatch(output, /old rows/);
    }
});

test('missing or duplicate generation boundaries and metadata abort rendering', () => {
    assert.throws(() => renderPage(document.replace('<!-- supported-chains:end -->', ''), data()));
    assert.throws(() => renderPage(document + '<!-- supported-chains:start -->', data()));
    assert.throws(() => renderPage(document.replace('chain_viem: old', 'chain_viem: old\nchain_viem: duplicate'), data()));
});

test('the real released snapshot resolves locked dependencies and known support boundaries', () => {
    const released = snapshot(app, '@aragon/app@1.38.0', dependencies);
    assert.equal(released.commit, 'd1fa9970e98cf1dbc9b74b17290eebc322850ab1');
    assert.equal(released.viem, '2.55.13');
    assert.equal(released.rows.length, 13);
    assert.deepEqual(released.rows.filter((row) => row.testnet).map((row) => row.id), [11155111]);
    assert.deepEqual(released.rows.filter((row) => !row.simulation).map((row) => row.name), ['Chiliz', 'Citrea', 'Hemi']);
    assert.throws(() => snapshot(app, 'main', dependencies), /official stable/);
});

test('a failed write command leaves the real reference byte-for-byte intact', () => {
    const path = resolve('application/supported-chains.md');
    const before = readFileSync(path);
    const result = spawnSync(process.execPath, ['.claude/skills/reconcile-app-releases/scripts/supported-chains.mjs', '--app', app, '--release', 'main', '--write'], { encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /official stable/);
    assert.deepEqual(readFileSync(path), before);
});
