'use strict';
// Unit tests of the pure logic in affected.cjs, on inline fixtures: no map, app tree or git needed.
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    affectedParts,
    changedStrings,
    checkMap,
    groupByParts,
    isIgnored,
    kitComponents,
    kitFileBelongsTo,
    matchesGlob,
    matchingFiles,
    parseArgs,
    recordCommit,
    stringsInPart,
} = require('./affected.cjs');

const KIT = 'packages/gov-ui-kit/src/';

test('globs: ** crosses directories, * stays inside one name', () => {
    assert.ok(matchesGlob('a/b/c.tsx', 'a/**'));
    assert.ok(matchesGlob('a/b/c/d.tsx', 'a/**/d.tsx'));
    assert.ok(matchesGlob('a/d.tsx', 'a/**/d.tsx'));
    assert.ok(matchesGlob('a/proposalList/x.ts', 'a/proposal*/**'));
    assert.ok(!matchesGlob('a/b/c.tsx', 'a/*'));
    assert.ok(matchesGlob('a/c.tsx', 'a/*.tsx'));
    assert.ok(!matchesGlob('ab/c.tsx', 'a/**'));
    assert.ok(!matchesGlob('a/cXtsx', 'a/c.tsx'));
});

test('ignored files: tests, stories, mocks, docs', () => {
    for (const file of [
        'apps/app/src/x/foo.test.tsx',
        'apps/app/src/x/foo.stories.tsx',
        'apps/app/src/x/__mocks__/foo.ts',
        'apps/app/src/x/testUtils/foo.ts',
        'apps/app/src/backendApiMocks.ts',
        'apps/app/docs/x.md',
    ]) {
        assert.ok(isIgnored(file), file);
    }
    assert.ok(!isIgnored('apps/app/src/x/foo.tsx'));
    assert.ok(!isIgnored('apps/app/src/x/mockingbird.tsx'));
});

test('files map to a part through its sources, never the locale', () => {
    const files = [
        'apps/app/src/m/pageA/a.tsx',
        'apps/app/src/m/pageB/b.tsx',
        'apps/app/src/assets/locales/en.json',
    ];
    assert.deepEqual(matchingFiles(files, ['apps/app/src/m/pageA/**']), [
        'apps/app/src/m/pageA/a.tsx',
    ]);
    assert.deepEqual(matchingFiles(files, ['apps/app/src/assets/**']), []);
});

test('kit components come from the part file', () => {
    const text = `<x-import component-from-global-scope="GovUiKit.Button" a="b">
        <x-import component-from-global-scope="GovUiKit.ProposalVoting.Stage">
        <x-import component-from-global-scope="GovUiKit.Button">`;
    assert.deepEqual(kitComponents(text), ['Button', 'ProposalVoting']);
    assert.deepEqual(kitComponents('<div>GovUiKit.Card</div>'), []);
});

test('a kit file belongs to a component when a path name starts with it', () => {
    const stage = `${KIT}modules/components/proposal/proposalVoting/proposalVotingStage/proposalVotingStage.tsx`;
    assert.ok(kitFileBelongsTo(stage, 'ProposalVoting'));
    assert.ok(
        kitFileBelongsTo(`${KIT}core/components/cards/card/card.tsx`, 'Card'),
    );
    assert.ok(
        kitFileBelongsTo(
            `${KIT}core/components/dialogs/dialog/dialogRoot/dialogRoot.tsx`,
            'Dialog',
        ),
    );
    assert.ok(!kitFileBelongsTo(stage, 'Button'));
    // The src/ prefix itself never counts.
    assert.ok(!kitFileBelongsTo(`${KIT}core/components/tag/tag.tsx`, 'Gov'));
});

test('changed strings skip short and mostly interpolated text', () => {
    const before = {
        a: {
            long: 'Delegating increases the voting power',
            short: 'Edit',
            gone: 'This text was removed',
            same: 'Nothing changes here',
        },
        b: '{{one}} {{two}} {{three}} x',
    };
    const after = {
        a: {
            long: 'Delegating increases power',
            short: 'Change',
            same: 'Nothing changes here',
        },
        b: '{{one}} {{two}} {{three}} y',
    };
    assert.deepEqual(changedStrings(before, after), [
        { key: 'a.long', old: 'Delegating increases the voting power' },
        { key: 'a.gone', old: 'This text was removed' },
    ]);
});

test('strings are reported when the old text is in the part', () => {
    const changed = [
        { key: 'a.long', old: 'Delegating increases the voting power' },
        { key: 'a.gone', old: 'This text was removed' },
    ];
    assert.deepEqual(
        stringsInPart(changed, '<p>Delegating increases the voting power</p>'),
        ['a.long'],
    );
});

test('affected parts: files, kit, strings, partChanged and unmapped', () => {
    const map = {
        parts: {
            One: { route: '/one', sources: ['apps/app/src/one/**'] },
            Two: { sources: ['apps/app/src/two/**'] },
            Three: { sources: ['apps/app/src/three/**'] },
        },
    };
    const texts = {
        One: '<p>nothing</p>',
        Two: '<x-import component-from-global-scope="GovUiKit.Tag"><p>Old words here</p>',
        Three: '<p>nothing</p>',
    };
    const result = affectedParts({
        map,
        appFiles: [
            'apps/app/src/one/a.tsx',
            'apps/app/src/other/b.tsx',
            'apps/app/src/other/c.ts',
        ],
        kitFiles: [
            `${KIT}core/components/tag/tag.tsx`,
            `${KIT}core/components/spinner/spinner.tsx`,
        ],
        strings: [{ key: 'k.old', old: 'Old words here' }],
        partFiles: ['One'],
        readPart: (part) => texts[part],
    });
    assert.deepEqual(result.parts, [
        {
            part: 'One',
            files: ['apps/app/src/one/a.tsx'],
            kit: [],
            strings: [],
            partChanged: true,
        },
        {
            part: 'Two',
            files: [],
            kit: [`${KIT}core/components/tag/tag.tsx`],
            strings: ['k.old'],
            partChanged: false,
        },
    ]);
    assert.deepEqual(result.unmapped, [
        'apps/app/src/other/b.tsx',
        `${KIT}core/components/spinner/spinner.tsx`,
    ]);
});

test('arguments', () => {
    assert.deepEqual(parseArgs([]), {
        json: false,
        check: false,
        record: null,
    });
    assert.deepEqual(parseArgs(['--base', 'a1', '--head', 'b2', '--json']), {
        json: true,
        check: false,
        record: null,
        base: 'a1',
        head: 'b2',
    });
    assert.equal(parseArgs(['--record']).record, 'HEAD');
    assert.equal(parseArgs(['--record', 'abc']).record, 'abc');
    assert.equal(parseArgs(['--record', '--json']).record, 'HEAD');
    assert.equal(parseArgs(['--check']).check, true);
    assert.throws(() => parseArgs(['--base']), /needs a commit/);
    assert.throws(() => parseArgs(['--base', '--json']), /needs a commit/);
    assert.throws(() => parseArgs(['--nope']), /unknown argument/);
});

test('record changes only the appCommit line', () => {
    const text =
        '{\n    "a": [ 1,2 ],\n    "appCommit": "abc123",\n    "b": 1\n}\n';
    assert.equal(
        recordCommit(text, 'f'.repeat(40)),
        `{\n    "a": [ 1,2 ],\n    "appCommit": "${'f'.repeat(40)}",\n    "b": 1\n}\n`,
    );
    assert.throws(() => recordCommit('{}', 'abc'), /no appCommit/);
});

test('an entry whose part file is gone is skipped', () => {
    const result = affectedParts({
        map: { parts: { Gone: { sources: ['src/gone/**'] } } },
        appFiles: ['src/gone/a.tsx'],
        kitFiles: [],
        strings: [],
        partFiles: [],
        readPart: () => null,
    });
    assert.deepEqual(result.parts, []);
    assert.deepEqual(result.unmapped, ['src/gone/a.tsx']);
});

test('report groups: files that reach the same parts are listed together', () => {
    const parts = [
        { part: 'One', files: ['a.tsx', 'b.tsx'] },
        { part: 'Two', files: ['a.tsx', 'b.tsx', 'c.tsx'] },
    ];
    assert.deepEqual(groupByParts(parts, 'files'), [
        { names: 'One, Two', items: ['a.tsx', 'b.tsx'] },
        { names: 'Two', items: ['c.tsx'] },
    ]);
});

test('map check: entries, files and globs', () => {
    const map = {
        parts: {
            One: { sources: ['src/one/**'] },
            Extra: { sources: ['src/missing/**'] },
        },
    };
    assert.deepEqual(
        checkMap({
            map,
            partNames: ['One', 'Lonely'],
            trackedFiles: ['src/one/a.ts'],
        }),
        [
            'no entry for Lonely.dc.html',
            'entry Extra has no Extra.dc.html',
            'Extra: "src/missing/**" matches no tracked file',
        ],
    );
    assert.deepEqual(
        checkMap({
            map: { parts: { One: map.parts.One } },
            partNames: ['One'],
            trackedFiles: ['src/one/a.ts'],
        }),
        [],
    );
});
