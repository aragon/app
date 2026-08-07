#!/usr/bin/env node
// Canonical skills synchronization.
//
// Discovers skills under skills/shared/*/SKILL.md and skills/local/*/SKILL.md,
// installs them (copy mode, non-interactive) into the agent discovery roots
// supported by the pinned `skills` CLI, then validates the generated filesystem.
//
// Skips: CI=1, SKIP_SKILLS_SYNC=1, or missing devDependency (intentional omit).
// Never modifies canonical source files. Idempotent. Cross-platform.

import { execFileSync } from 'node:child_process';
import {
    existsSync,
    readdirSync,
    readFileSync,
    rmSync,
    statSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const skillsRoot = join(repoRoot, 'skills');
const sharedDir = join(skillsRoot, 'shared');
const localDir = join(skillsRoot, 'local');

const GENERATED_ROOTS = [
    join(repoRoot, '.agents', 'skills'),
    join(repoRoot, '.claude', 'skills'),
];

const AGENT_FLAGS = [
    // codex, cursor, and gemini-cli all resolve to the same universal .agents/skills
    // store in the pinned CLI, so passing each would clean+recopy that dir once per
    // agent. `universal` writes .agents/skills exactly once; claude-code writes
    // .claude/skills. Together they cover both generated roots with no repeated work.
    '-a',
    'universal',
    '-a',
    'claude-code',
];

// --- skip conditions ---

if (process.env.CI && process.env.CI !== '0' && process.env.CI !== 'false') {
    console.log('[skills] CI detected — skipping sync.');
    process.exit(0);
}
if (process.env.SKIP_SKILLS_SYNC === '1') {
    console.log('[skills] SKIP_SKILLS_SYNC=1 — skipping sync.');
    process.exit(0);
}

// --- locate the pinned CLI binary ---

const cliBin = join(repoRoot, 'node_modules', '.bin', 'skills');
if (!existsSync(cliBin)) {
    console.log(
        '[skills] skills CLI not installed (devDependency omitted) — skipping sync.',
    );
    process.exit(0);
}

// --- discovery ---

/**
 * Enumerate direct child skill directories under a catalog dir.
 * Returns [{ name, dir, catalog }] where dir contains SKILL.md.
 * Rejects category-level SKILL.md (SKILL.md directly under shared/ or local/).
 */
function discoverCatalog(catalogDir, catalogName) {
    const skills = [];
    if (!existsSync(catalogDir)) {
        return skills;
    }

    // Reject a category-level SKILL.md — it would be discovered as a skill
    // named "shared" or "local", which violates the catalog contract.
    const categorySkill = join(catalogDir, 'SKILL.md');
    if (existsSync(categorySkill)) {
        console.error(
            `[skills] ERROR: found SKILL.md directly under skills/${catalogName}/ — categories must not be skills.`,
        );
        process.exit(1);
    }

    for (const entry of readdirSync(catalogDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }
        const skillDir = join(catalogDir, entry.name);
        const skillMd = join(skillDir, 'SKILL.md');
        if (!existsSync(skillMd)) {
            continue;
        }

        // Validate frontmatter name matches directory.
        const parsed = parseFrontmatter(skillMd);
        if (!parsed?.name) {
            console.error(
                `[skills] ERROR: skills/${catalogName}/${entry.name}/SKILL.md missing required frontmatter field "name".`,
            );
            process.exit(1);
        }
        if (parsed.name !== entry.name) {
            console.error(
                `[skills] ERROR: skills/${catalogName}/${entry.name}/SKILL.md frontmatter name "${parsed.name}" does not match directory "${entry.name}".`,
            );
            process.exit(1);
        }
        if (!parsed.description) {
            console.error(
                `[skills] ERROR: skills/${catalogName}/${entry.name}/SKILL.md missing required frontmatter field "description".`,
            );
            process.exit(1);
        }

        skills.push({ name: entry.name, dir: skillDir, catalog: catalogName });
    }
    return skills;
}

function parseFrontmatter(skillMdPath) {
    const content = readFileSync(skillMdPath, 'utf-8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
        return null;
    }
    const yaml = match[1];
    const nameMatch = yaml.match(/^name:\s*(.+)$/m);
    const descMatch = yaml.match(/^description:\s*(.+)$/m);
    return {
        name: nameMatch?.[1]?.trim().replace(/^['"]|['"]$/g, '') || null,
        description: descMatch?.[1]?.trim() || null,
    };
}

const sharedSkills = discoverCatalog(sharedDir, 'shared');
const rulesSkills = discoverCatalog(join(sharedDir, 'rules'), 'shared/rules');
const localSkills = discoverCatalog(localDir, 'local');
// --- duplicate name check across catalogs ---

const allSkills = [...sharedSkills, ...rulesSkills, ...localSkills];
const seenNames = new Set();
for (const skill of allSkills) {
    if (seenNames.has(skill.name)) {
        const holders = allSkills
            .filter((s) => s.name === skill.name)
            .map((s) => `skills/${s.catalog}/${s.name}`);
        console.error(
            `[skills] ERROR: duplicate skill name "${skill.name}" found in: ${holders.join(', ')}. Skill names must be unique across shared and local.`,
        );
        process.exit(1);
    }
    seenNames.add(skill.name);
}

if (allSkills.length === 0) {
    console.log('[skills] No skills found — nothing to sync.');
    process.exit(0);
}

console.log(
    `[skills] Discovered ${allSkills.length} skill(s): ${allSkills.map((s) => s.name).join(', ')}`,
);

// --- clean generated roots before install (idempotent reconciliation) ---

// Remove any existing generated skill directories so the CLI install is clean
// and stale skills are reconciled. Only remove directories that contain a
// SKILL.md (to avoid nuking unrelated content an agent may have placed).
for (const root of GENERATED_ROOTS) {
    if (!existsSync(root)) {
        continue;
    }
    for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            continue;
        }
        const staleSkillMd = join(root, entry.name, 'SKILL.md');
        if (existsSync(staleSkillMd)) {
            rmSync(join(root, entry.name), { recursive: true, force: true });
        }
    }
}

// --- install via pinned CLI (copy mode, non-interactive) ---

// The CLI discovers skills under the given path via --full-depth and installs
// all of them (--skill '*') to the configured agents. --copy avoids symlinks
// into the gitignored .agents/skills/ canonical store.
try {
    const args = [
        'add',
        skillsRoot,
        '--full-depth',
        '--skill',
        '*',
        ...AGENT_FLAGS,
        '--copy',
        '--yes',
    ];
    console.log(`[skills] Running: skills ${args.join(' ')}`);
    execFileSync(cliBin, args, { cwd: repoRoot, stdio: 'inherit' });
} catch {
    console.error('[skills] ERROR: skills CLI failed.');
    process.exit(1);
}

// --- validate generated filesystem ---

/**
 * Validate that every canonical skill exists at each generated root with a
 * SKILL.md, the directory name matches the skill name, and categories were
 * flattened (no shared/ or local/ subdir in the generated root).
 */
function validateRoot(root) {
    if (!existsSync(root)) {
        // CLI only writes to roots for detected agents; missing root is not
        // necessarily an error, but we log it.
        console.log(
            `[skills] Note: generated root ${relative(repoRoot, root)} does not exist (agent may not be detected).`,
        );
        return;
    }

    // Flattening check: no shared/ or local/ inside generated root.
    for (const category of ['shared', 'local']) {
        const categoryDir = join(root, category);
        if (existsSync(categoryDir)) {
            console.error(
                `[skills] ERROR: category directory "${category}" found in generated root ${relative(repoRoot, root)} — categories were not flattened.`,
            );
            process.exit(1);
        }
    }

    for (const skill of allSkills) {
        const generatedDir = join(root, skill.name);
        const generatedSkillMd = join(generatedDir, 'SKILL.md');
        if (!existsSync(generatedDir)) {
            console.error(
                `[skills] ERROR: skill "${skill.name}" missing from generated root ${relative(repoRoot, root)}.`,
            );
            process.exit(1);
        }
        if (!existsSync(generatedSkillMd)) {
            console.error(
                `[skills] ERROR: SKILL.md missing for skill "${skill.name}" in ${relative(repoRoot, generatedDir)}.`,
            );
            process.exit(1);
        }

        // Validate supporting files were preserved. README.md is intentionally not
        // required in generated output: it is often a category/skill doc, not an
        // agent-consumed asset, and the pinned CLI (1.5.20) excludes only metadata.json.
        const sourceEntries = readdirSync(skill.dir, { withFileTypes: true })
            .filter((e) => e.name !== 'SKILL.md' && e.name !== 'README.md')
            .map((e) => e.name);
        for (const entry of sourceEntries) {
            const generatedEntry = join(generatedDir, entry);
            if (!existsSync(generatedEntry)) {
                console.error(
                    `[skills] ERROR: supporting file "${entry}" for skill "${skill.name}" missing in ${relative(repoRoot, generatedDir)}.`,
                );
                process.exit(1);
            }
        }
    }
}

for (const root of GENERATED_ROOTS) {
    validateRoot(root);
}

// --- executable permissions check ---

for (const skill of allSkills) {
    const scriptsDir = join(skill.dir, 'scripts');
    if (!existsSync(scriptsDir)) {
        continue;
    }
    for (const entry of readdirSync(scriptsDir, { withFileTypes: true })) {
        if (!entry.isFile()) {
            continue;
        }
        const scriptPath = join(scriptsDir, entry.name);
        const sourceMode = statSync(scriptPath).mode;
        const isExecutable = (sourceMode & 0o111) !== 0;
        if (!isExecutable) {
            continue;
        }
        // Verify the executable bit survived in generated copies.
        for (const root of GENERATED_ROOTS) {
            const generatedScript = join(
                root,
                skill.name,
                'scripts',
                entry.name,
            );
            if (existsSync(generatedScript)) {
                const genMode = statSync(generatedScript).mode;
                if ((genMode & 0o111) === 0) {
                    console.error(
                        `[skills] ERROR: executable bit lost on ${relative(repoRoot, generatedScript)}.`,
                    );
                    process.exit(1);
                }
            }
        }
    }
}

console.log(
    `[skills] Sync complete: ${allSkills.length} skill(s) installed to ${GENERATED_ROOTS.map((r) => relative(repoRoot, r)).join(', ')}.`,
);
