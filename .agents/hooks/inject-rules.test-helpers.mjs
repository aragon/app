import { strict as assert } from 'node:assert/strict';
import {
    mkdirSync,
    mkdtempSync,
    readdirSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, before, beforeEach, describe, it } from 'node:test';
import { TRIGGER_TOOLS } from './inject-rules.mjs';

export const TMP_PREFIX = 'inject-rules-test-';

export const registerTmpCleanup = () => {
    before(() => {
        const root = tmpdir();
        for (const entry of readdirSync(root)) {
            if (entry.startsWith(TMP_PREFIX)) {
                rmSync(join(root, entry), { recursive: true, force: true });
            }
        }
    });
};

export const registerGuardrailsContractSuite = ({
    suiteName,
    buildResult,
    assertHitOutput,
}) => {
    describe(suiteName, () => {
        let tmp;
        let ruleDir;

        beforeEach(() => {
            tmp = mkdtempSync(join(tmpdir(), TMP_PREFIX));
            ruleDir = join(tmp, 'rules');
            mkdirSync(ruleDir);
            writeFileSync(
                join(ruleDir, 'q.md'),
                '---\nname: q\napplies-to: src/**/api/**\nkind: rule\n---\nquery rule body',
            );
            mkdirSync(join(tmp, 'src', 'shared', 'api'), { recursive: true });
        });

        afterEach(() => {
            rmSync(tmp, { recursive: true, force: true });
        });

        it('returns null for non-trigger tool', () => {
            const result = buildResult(
                {
                    tool_name: 'Read',
                    tool_input: { file_path: join(tmp, 'src/shared/api/x.ts') },
                },
                { repoRoot: tmp, ruleRoots: ['rules'] },
            );
            assert.equal(result, null);
        });

        it('returns null for missing file_path', () => {
            const result = buildResult(
                { tool_name: 'Edit', tool_input: {} },
                { repoRoot: tmp, ruleRoots: ['rules'] },
            );
            assert.equal(result, null);
        });

        it('returns null when no rule globs match', () => {
            const result = buildResult(
                {
                    tool_name: 'Edit',
                    tool_input: {
                        file_path: join(tmp, 'src/shared/components/x.tsx'),
                    },
                },
                { repoRoot: tmp, ruleRoots: ['rules'] },
            );
            assert.equal(result, null);
        });

        it('returns matched rules for a hit', () => {
            const result = buildResult(
                {
                    tool_name: 'Edit',
                    tool_input: {
                        file_path: join(tmp, 'src/shared/api/x.ts'),
                    },
                },
                { repoRoot: tmp, ruleRoots: ['rules'] },
            );

            assert.ok(result);
            assert.deepEqual(result.matches, ['q']);
            assertHitOutput(result.output, {
                relPath: 'src/shared/api/x.ts',
                ruleName: 'q',
                ruleBody: 'query rule body',
            });
        });

        it('handles all trigger tool names', () => {
            for (const toolName of TRIGGER_TOOLS) {
                const result = buildResult(
                    {
                        tool_name: toolName,
                        tool_input: {
                            file_path: join(tmp, 'src/shared/api/x.ts'),
                        },
                    },
                    { repoRoot: tmp, ruleRoots: ['rules'] },
                );
                assert.ok(result, `expected match for tool ${toolName}`);
            }
        });
    });
};
