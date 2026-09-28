// Skills system contract tests.
//
// Validates the canonical skills layout, frontmatter, name-directory
// consistency, flattening, and git-ignore contract. Run via:
//   node --test scripts/sync-skills.test.mjs
//   pnpm test:skills

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
    existsSync,
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import {
    GENERATED_ROOTS,
    MANIFEST_PATH,
    parseFrontmatter,
    repoRoot,
} from './sync-skills.mjs';

const skillsRoot = join(repoRoot, 'skills');
const sharedDir = join(skillsRoot, 'shared');
const localDir = join(skillsRoot, 'local');
const rulesDir = join(sharedDir, 'rules');

/**
 * Enumerate skill directories under a catalog dir.
 */
function discoverSkills(catalogDir) {
    if (!existsSync(catalogDir)) {
        return [];
    }
    return readdirSync(catalogDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .filter((e) => existsSync(join(catalogDir, e.name, 'SKILL.md')))
        .map((e) => ({ name: e.name, dir: join(catalogDir, e.name) }));
}

const sharedSkills = discoverSkills(sharedDir);
const rulesSkills = discoverSkills(rulesDir);
const localSkills = discoverSkills(localDir);
const allSkills = [...sharedSkills, ...rulesSkills, ...localSkills];
// Rule-skills are hook-only guardrails and are never installed to the
// generated discovery roots; everything else is.
const installedSkills = [...sharedSkills, ...localSkills];

// --- directory structure ---

test('skills/shared/ exists with the rules sub-catalog', () => {
    assert.ok(existsSync(sharedDir), 'skills/shared/ must exist');
    assert.ok(
        existsSync(rulesDir),
        'skills/shared/rules/ must exist (rule-skills are shared)',
    );
    assert.ok(
        rulesSkills.length > 0,
        'skills/shared/rules/ must contain at least one rule-skill',
    );
});

test('skills/local/ exists with .gitignore and README.md', () => {
    assert.ok(existsSync(localDir), 'skills/local/ must exist');
    assert.ok(
        existsSync(join(localDir, '.gitignore')),
        'skills/local/.gitignore must exist',
    );
    assert.ok(
        existsSync(join(localDir, 'README.md')),
        'skills/local/README.md must exist',
    );
});

test('no category-level SKILL.md directly under shared/, shared/rules/, or local/', () => {
    for (const dir of [sharedDir, rulesDir, localDir]) {
        assert.ok(
            !existsSync(join(dir, 'SKILL.md')),
            `SKILL.md must not exist directly under ${dir}`,
        );
    }
});

test('no empty agents/, references/, scripts/, assets/, or evals/ directories', () => {
    for (const skill of allSkills) {
        for (const subdir of [
            'agents',
            'references',
            'scripts',
            'assets',
            'evals',
        ]) {
            const dir = join(skill.dir, subdir);
            if (existsSync(dir)) {
                const entries = readdirSync(dir);
                assert.ok(
                    entries.length > 0,
                    `${skill.name}/${subdir}/ must not be empty`,
                );
            }
        }
    }
});

// --- frontmatter validation ---

test('every skill has valid frontmatter with name and description', () => {
    for (const skill of allSkills) {
        const skillMd = join(skill.dir, 'SKILL.md');
        const parsed = parseFrontmatter(skillMd);
        assert.ok(parsed, `${skill.name}/SKILL.md must have frontmatter`);
        assert.ok(parsed.name, `${skill.name}/SKILL.md must have a name field`);
        assert.ok(
            parsed.description,
            `${skill.name}/SKILL.md must have a description field`,
        );
    }
});

test('frontmatter name matches containing directory', () => {
    for (const skill of allSkills) {
        const parsed = parseFrontmatter(join(skill.dir, 'SKILL.md'));
        assert.equal(
            parsed.name,
            skill.name,
            `${skill.name}/SKILL.md frontmatter name must match directory`,
        );
    }
});

test('block-scalar descriptions are rejected', () => {
    const dir = mkdtempSync(join(tmpdir(), 'skill-spec-'));
    const md = join(dir, 'SKILL.md');
    try {
        for (const indicator of [
            '>',
            '|',
            '>-',
            '|-',
            '>+',
            '|+',
            '>2',
            '|2',
        ]) {
            writeFileSync(md, `---\nname: x\ndescription: ${indicator}\n---\n`);
            const parsed = parseFrontmatter(md);
            assert.ok(
                parsed?.error,
                `description: ${indicator} must be rejected (single-line descriptions only)`,
            );
            assert.match(parsed.error, /block scalar/);
        }
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
});

// --- name uniqueness ---

test('skill names are unique across shared, rules, and local', () => {
    const names = allSkills.map((s) => s.name);
    const duplicates = names.filter((n, i) => names.indexOf(n) !== i);
    assert.deepEqual(
        duplicates,
        [],
        `duplicate skill names: ${duplicates.join(', ')}`,
    );
});

// --- generated roots (only if sync has run) ---

test('generated roots are flattened (no shared/ or local/ subdir)', {
    skip: !GENERATED_ROOTS.some(existsSync) ? 'sync has not run' : undefined,
}, () => {
    for (const root of GENERATED_ROOTS) {
        if (!existsSync(root)) {
            continue;
        }
        for (const category of ['shared', 'local']) {
            const categoryDir = join(root, category);
            assert.ok(
                !existsSync(categoryDir),
                `${category}/ must not exist in generated root ${root}`,
            );
        }
    }
});

test('every installed skill exists in each generated root', {
    skip: !GENERATED_ROOTS.some(existsSync) ? 'sync has not run' : undefined,
}, () => {
    for (const root of GENERATED_ROOTS) {
        if (!existsSync(root)) {
            continue;
        }
        for (const skill of installedSkills) {
            const generatedDir = join(root, skill.name);
            const generatedSkillMd = join(generatedDir, 'SKILL.md');
            assert.ok(
                existsSync(generatedDir),
                `skill ${skill.name} missing from ${root}`,
            );
            assert.ok(
                existsSync(generatedSkillMd),
                `SKILL.md missing for ${skill.name} in ${root}`,
            );
        }
    }
});

test('rule-skills are NOT installed into generated roots (hook-only)', {
    skip: !GENERATED_ROOTS.some(existsSync) ? 'sync has not run' : undefined,
}, () => {
    for (const root of GENERATED_ROOTS) {
        if (!existsSync(root)) {
            continue;
        }
        for (const skill of rulesSkills) {
            assert.ok(
                !existsSync(join(root, skill.name)),
                `rule-skill ${skill.name} must not be installed to ${root} (rules are hook-only)`,
            );
        }
    }
});

// --- manifest (only if sync has run) ---

test('manifest tracks exactly the installed skills', {
    skip: !existsSync(MANIFEST_PATH) ? 'sync has not run' : undefined,
}, () => {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
    assert.equal(manifest.version, 1);
    const installedNames = installedSkills.map((s) => s.name).sort();
    for (const root of GENERATED_ROOTS.map((r) =>
        r.replace(`${repoRoot}/`, ''),
    )) {
        assert.ok(
            Object.hasOwn(manifest.roots, root),
            `manifest must record ${root}`,
        );
        assert.deepEqual(
            [...manifest.roots[root]].sort(),
            installedNames,
            `manifest entries for ${root} must match the installed skill set`,
        );
    }
});

// --- git-ignore contract ---

test('generated skill roots and sync manifest are gitignored', () => {
    for (const path of [
        '.agents/skills/test',
        '.claude/skills/test',
        '.skills-sync-manifest.json',
        'skills-lock.json',
    ]) {
        const result = execFileSync('git', ['check-ignore', '-v', path], {
            cwd: repoRoot,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).toString();
        assert.ok(result.includes(path), `${path} must be gitignored`);
    }
});

test('canonical shared rule-skills are not gitignored', () => {
    for (const skill of rulesSkills) {
        const skillMd = `skills/shared/rules/${skill.name}/SKILL.md`;
        let ignored = false;
        try {
            execFileSync('git', ['check-ignore', skillMd], {
                cwd: repoRoot,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            ignored = true;
        } catch {
            ignored = false;
        }
        assert.ok(!ignored, `${skillMd} must not be gitignored`);
    }
});

test('local skill contents are gitignored', () => {
    for (const skill of localSkills) {
        const skillMd = `skills/local/${skill.name}/SKILL.md`;
        const result = execFileSync('git', ['check-ignore', '-v', skillMd], {
            cwd: repoRoot,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).toString();
        assert.ok(
            result.includes('skills/local/.gitignore'),
            `${skillMd} must be gitignored by skills/local/.gitignore`,
        );
    }
});

test('local .gitignore and README.md are not gitignored', () => {
    for (const file of ['skills/local/.gitignore', 'skills/local/README.md']) {
        let ignored = false;
        try {
            execFileSync('git', ['check-ignore', file], {
                cwd: repoRoot,
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            ignored = true;
        } catch {
            ignored = false;
        }
        assert.ok(!ignored, `${file} must not be gitignored`);
    }
});
