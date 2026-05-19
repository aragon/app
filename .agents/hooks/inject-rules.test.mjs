// Tests for the shared guardrails loader.
//
// Cleanup model: every test that touches the file system uses mkdtempSync
// against os.tmpdir() (a unique dir per call, outside the repo) and removes
// it in afterEach. The pre-test sweep below defensively reaps any leftover
// inject-rules-test-* dirs from a prior crashed run so /tmp doesn't bloat.
// No test writes to the repo working tree, so `git status` stays clean.

import { strict as assert } from 'node:assert/strict';
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
    buildAdditionalContext,
    buildHookOutput,
    buildRuleMatch,
    canonicalize,
    collectRules,
    DEFAULT_REPO_ROOT,
    globToRegex,
    parseCliArgs,
    parseFrontmatter,
    pathMatches,
    TRIGGER_TOOLS,
} from './inject-rules.mjs';
import {
    registerGuardrailsContractSuite,
    registerTmpCleanup,
    TMP_PREFIX,
} from './inject-rules.test-helpers.mjs';

registerTmpCleanup();

describe('parseFrontmatter', () => {
    it('extracts kebab-case and hyphenated keys', () => {
        const { meta, body } = parseFrontmatter(
            '---\nname: foo\nglobs: src/**\nkind: rule\n---\nbody here',
        );
        assert.equal(meta.name, 'foo');
        assert.equal(meta.globs, 'src/**');
        assert.equal(meta.kind, 'rule');
        assert.equal(body, 'body here');
    });

    it('returns empty meta when no frontmatter', () => {
        const { meta, body } = parseFrontmatter('# just a heading\n');
        assert.deepEqual(meta, {});
        assert.equal(body, '# just a heading\n');
    });

    it('preserves colons in values', () => {
        const { meta } = parseFrontmatter(
            '---\ndescription: a thing: with a colon\n---\n',
        );
        assert.equal(meta.description, 'a thing: with a colon');
    });
});

describe('globToRegex / pathMatches', () => {
    it('matches ** recursively', () => {
        assert.ok(globToRegex('src/**/api/**').test('src/shared/api/x/y.ts'));
        assert.ok(globToRegex('src/**/api/**').test('src/api/x.ts'));
    });

    it('matches single-segment *', () => {
        assert.ok(
            globToRegex('src/plugins/*/index.ts').test(
                'src/plugins/foo/index.ts',
            ),
        );
        assert.ok(
            !globToRegex('src/plugins/*/index.ts').test(
                'src/plugins/foo/bar/index.ts',
            ),
        );
    });

    it('escapes special regex chars in literal portions', () => {
        assert.ok(globToRegex('src/**/*.test.ts').test('src/a/b.test.ts'));
        assert.ok(!globToRegex('src/**/*.test.ts').test('src/a/bXtestXts'));
    });

    it('treats globs field as comma-separated patterns', () => {
        const globs = 'src/**/queries/**, src/**/mutations/**';
        assert.ok(pathMatches('src/x/queries/a.ts', globs));
        assert.ok(pathMatches('src/x/mutations/a.ts', globs));
        assert.ok(!pathMatches('src/x/components/a.tsx', globs));
    });

    it('returns false for empty or missing globs', () => {
        assert.equal(pathMatches('src/x.ts', undefined), false);
        assert.equal(pathMatches('src/x.ts', ''), false);
    });
});

describe('canonicalize', () => {
    it('returns a real existing path unchanged in shape', () => {
        const real = canonicalize(DEFAULT_REPO_ROOT);
        assert.ok(existsSync(real));
    });

    it('handles a non-existent file under an existing parent', () => {
        const fake = join(DEFAULT_REPO_ROOT, 'definitely-not-a-real-file.tmp');
        const out = canonicalize(fake);
        assert.ok(out.endsWith('definitely-not-a-real-file.tmp'));
    });
});

describe('collectRules', () => {
    let tmp;
    let ruleDir;

    beforeEach(() => {
        tmp = mkdtempSync(join(tmpdir(), TMP_PREFIX));
        ruleDir = join(tmp, 'rules');
        mkdirSync(ruleDir);
    });

    afterEach(() => {
        rmSync(tmp, { recursive: true, force: true });
    });

    it('discovers rule files with kind: rule', () => {
        writeFileSync(
            join(ruleDir, 'foo.md'),
            '---\nname: foo\nglobs: src/foo/**\nkind: rule\n---\nfoo body',
        );
        const rules = collectRules({ repoRoot: tmp, ruleRoots: ['rules'] });
        assert.equal(rules.length, 1);
        assert.equal(rules[0].name, 'foo');
        assert.equal(rules[0].globs, 'src/foo/**');
        assert.equal(rules[0].body.trim(), 'foo body');
    });

    it('skips README.md', () => {
        writeFileSync(
            join(ruleDir, 'README.md'),
            '---\nname: readme\nkind: rule\nglobs: **\n---\nx',
        );
        const rules = collectRules({ repoRoot: tmp, ruleRoots: ['rules'] });
        assert.equal(rules.length, 0);
    });

    it('skips files without kind: rule', () => {
        writeFileSync(
            join(ruleDir, 'cmd.md'),
            '---\nname: cmd\nkind: command\nglobs: **\n---\nx',
        );
        writeFileSync(join(ruleDir, 'plain.md'), '# no frontmatter');
        const rules = collectRules({ repoRoot: tmp, ruleRoots: ['rules'] });
        assert.equal(rules.length, 0);
    });

    it('returns empty when rule root does not exist', () => {
        const rules = collectRules({
            repoRoot: tmp,
            ruleRoots: ['does/not/exist'],
        });
        assert.deepEqual(rules, []);
    });

    it('merges across multiple rule roots', () => {
        const dir2 = join(tmp, 'local');
        mkdirSync(dir2);
        writeFileSync(
            join(ruleDir, 'shared.md'),
            '---\nname: shared\nglobs: src/**\nkind: rule\n---\nshared',
        );
        writeFileSync(
            join(dir2, 'local.md'),
            '---\nname: local\nglobs: src/**\nkind: rule\n---\nlocal',
        );
        const rules = collectRules({
            repoRoot: tmp,
            ruleRoots: ['rules', 'local'],
        });
        assert.equal(rules.length, 2);
        assert.deepEqual(rules.map((rule) => rule.name).sort(), [
            'local',
            'shared',
        ]);
    });
});

describe('buildRuleMatch', () => {
    let tmp;
    let ruleDir;

    beforeEach(() => {
        tmp = mkdtempSync(join(tmpdir(), TMP_PREFIX));
        ruleDir = join(tmp, 'rules');
        mkdirSync(ruleDir);
        writeFileSync(
            join(ruleDir, 'q.md'),
            '---\nname: q\nglobs: src/**/api/**\nkind: rule\n---\nquery rule body',
        );
        mkdirSync(join(tmp, 'src', 'shared', 'api'), { recursive: true });
    });

    afterEach(() => {
        rmSync(tmp, { recursive: true, force: true });
    });

    it('returns null for non-trigger tool', () => {
        const result = buildRuleMatch(
            {
                tool_name: 'Read',
                tool_input: { file_path: join(tmp, 'src/shared/api/x.ts') },
            },
            { repoRoot: tmp, ruleRoots: ['rules'] },
        );
        assert.equal(result, null);
    });

    it('keeps the injected rule stream identical across adapters', () => {
        const generic = buildHookOutput(
            {
                tool_name: 'Edit',
                tool_input: {
                    file_path: join(tmp, 'src/shared/api/x.ts'),
                },
            },
            { repoRoot: tmp, ruleRoots: ['rules'] },
        );
        const claude = buildAdditionalContext(
            {
                tool_name: 'Edit',
                tool_input: {
                    file_path: join(tmp, 'src/shared/api/x.ts'),
                },
            },
            { repoRoot: tmp, ruleRoots: ['rules'] },
        );

        assert.equal(
            generic.output.additionalContext,
            claude.output.hookSpecificOutput.additionalContext,
        );
    });
});

registerGuardrailsContractSuite({
    suiteName: 'buildHookOutput generic contract',
    buildResult: buildHookOutput,
    assertHitOutput: (output, { relPath, ruleName, ruleBody }) => {
        assert.equal(output.relPath, relPath);
        assert.match(output.additionalContext, new RegExp(ruleBody));
        assert.match(
            output.additionalContext,
            new RegExp(`<rule-skill name="${ruleName}"`),
        );
    },
});

describe('parseCliArgs', () => {
    it('parses inline and positional forms', () => {
        const result = parseCliArgs([
            '--adapter=claude',
            '--tool',
            'Write',
            '--file',
            '/tmp/example.ts',
            '--rule-root=rules',
            '--rule-root',
            'local',
        ]);

        assert.equal(result.adapter, 'claude');
        assert.equal(result.toolName, 'Write');
        assert.equal(result.filePath, '/tmp/example.ts');
        assert.deepEqual(result.ruleRoots, ['rules', 'local']);
    });
});

describe('trigger tools', () => {
    it('covers the edit-family tools', () => {
        assert.deepEqual([...TRIGGER_TOOLS].sort(), [
            'Edit',
            'MultiEdit',
            'Write',
        ]);
    });
});
