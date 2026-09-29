#!/usr/bin/env node
// Canonical skills synchronization.
//
// Discovers workflow skills under skills/shared/*/SKILL.md and local skills
// under skills/local/*/SKILL.md, installs them (copy mode, non-interactive)
// into the agent discovery roots supported by the pinned `skills` CLI, then
// validates the generated filesystem.
//
// Rule-skills (skills/shared/rules/*) are validated for structure and
// frontmatter here but intentionally NOT installed to the discovery roots:
// they are path-scoped guardrails injected by the PreToolUse hook loader at
// .agents/shared/hooks/inject-rules.mjs, not invocable capabilities. Syncing
// them would make Claude Code load them as global skills with no path gating.
//
// Reconciliation is manifest-driven: only skill directories a previous run of
// this script installed are ever removed from the generated roots. Anything
// else — personal skills kept in .claude/skills/ or .agents/skills/ — is left
// alone. The manifest lives at .skills-sync-manifest.json (gitignored).
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
    writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(__dirname, '..');
const skillsRoot = join(repoRoot, 'skills');
const sharedDir = join(skillsRoot, 'shared');
const rulesDir = join(sharedDir, 'rules');
const localDir = join(skillsRoot, 'local');

export const GENERATED_ROOTS = [
    join(repoRoot, '.agents', 'skills'),
    join(repoRoot, '.claude', 'skills'),
];

export const MANIFEST_PATH = join(repoRoot, '.skills-sync-manifest.json');

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

// Exit code used for every validation/CLI failure. `postinstall` passes
// `--soft` so a bad local SKILL.md or a broken CLI reports the error but never
// breaks `pnpm install`; `pnpm skills:sync` stays strict (exit 1).
const FAIL_CODE = process.argv.includes('--soft') ? 0 : 1;

export function skipConditions() {
    if (
        process.env.CI &&
        process.env.CI !== '0' &&
        process.env.CI !== 'false'
    ) {
        console.log(
            '[skills] CI detected — skipping sync. Install skills manually with `pnpm skills:sync`.',
        );
        return true;
    }
    if (process.env.SKIP_SKILLS_SYNC === '1') {
        console.log('[skills] SKIP_SKILLS_SYNC=1 — skipping sync.');
        return true;
    }
    return false;
}

export function cliAvailable() {
    const cliBin = join(repoRoot, 'node_modules', '.bin', 'skills');
    if (!existsSync(cliBin)) {
        console.log(
            '[skills] skills devDependency not installed — skipping sync. Install with `pnpm add -D skills@1.5.20`.',
        );
        return false;
    }
    return true;
}

// --- discovery ---

/**
 * Enumerate direct child skill directories under a catalog dir.
 * Returns [{ name, dir, catalog }] where dir contains SKILL.md.
 * Rejects category-level SKILL.md (SKILL.md directly under shared/ or local/).
 */
export function discoverCatalog(catalogDir, catalogName) {
    const skills = [];
    if (!existsSync(catalogDir)) {
        return skills;
    }
    for (const entry of readdirSync(catalogDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) {
            if (entry.name === 'SKILL.md') {
                console.error(
                    `[skills] ERROR: category-level SKILL.md is not allowed in skills/${catalogName}/ — skills must live in their own subdirectory.`,
                );
                process.exit(FAIL_CODE);
            }
            continue;
        }
        if (entry.name === 'rules' && catalogName === 'shared') {
            // rules/ is a sub-catalog, not a skill itself.
            continue;
        }
        const skillDir = join(catalogDir, entry.name);
        const skillMd = join(skillDir, 'SKILL.md');
        if (!existsSync(skillMd)) {
            continue;
        }
        const frontmatter = parseFrontmatter(skillMd);
        if (!frontmatter) {
            console.error(
                `[skills] ERROR: skills/${catalogName}/${entry.name}/SKILL.md missing YAML frontmatter.`,
            );
            process.exit(FAIL_CODE);
        }
        if (frontmatter.error) {
            console.error(frontmatter.error);
            process.exit(FAIL_CODE);
        }
        if (frontmatter.name !== entry.name) {
            console.error(
                `[skills] ERROR: frontmatter name "${frontmatter.name}" does not match directory skills/${catalogName}/${entry.name}/.`,
            );
            process.exit(FAIL_CODE);
        }
        if (!frontmatter.description) {
            console.error(
                `[skills] ERROR: skills/${catalogName}/${entry.name}/SKILL.md missing required frontmatter field "description".`,
            );
            process.exit(FAIL_CODE);
        }

        skills.push({ name: entry.name, dir: skillDir, catalog: catalogName });
    }
    return skills;
}

/**
 * Parse YAML frontmatter from a SKILL.md file.
 * Returns { name, description, error } or null if no frontmatter, where error
 * is set (and name/description null) when the frontmatter fails the
 * single-line-description convention. Descriptions are single-line by
 * convention; block scalar indicators (`>`, `|`) are rejected so a malformed
 * description like `description: >` fails loudly instead of silently passing
 * validation.
 */
export function parseFrontmatter(skillMdPath) {
    const content = readFileSync(skillMdPath, 'utf-8');
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
        return null;
    }
    const yaml = match[1];
    const nameMatch = yaml.match(/^name:\s*(.+)$/m);
    const descMatch = yaml.match(/^description:\s*(.+)$/m);
    const name = nameMatch?.[1]?.trim().replace(/^['"]|['"]$/g, '');
    const description = descMatch?.[1]?.trim();
    // Block scalar indicators with any chomping (`-`, `+`) or indentation
    // digit, e.g. `>`, `|-`, `>+`, `|2`. Descriptions are single-line by
    // convention; block scalars are rejected so a malformed description like
    // `description: >` fails loudly instead of silently passing validation.
    if (description !== null && /^[>|][-+]?\d*$/.test(description)) {
        return {
            name: null,
            description: null,
            error: `[skills] ERROR: ${skillMdPath} uses a YAML block scalar for "description" — use a single-line description instead.`,
        };
    }
    return { name: name || null, description: description || null };
}

export function discoverAllSkills() {
    const sharedSkills = discoverCatalog(sharedDir, 'shared');
    const rulesSkills = discoverCatalog(rulesDir, 'shared/rules');
    const localSkills = discoverCatalog(localDir, 'local');
    return { sharedSkills, rulesSkills, localSkills };
}

class SyncManifest {
    constructor() {
        this.version = 1;
        this.roots = {};
    }

    static load() {
        const manifest = new SyncManifest();
        try {
            const parsed = JSON.parse(readFileSync(MANIFEST_PATH, 'utf-8'));
            if (parsed && parsed.version === manifest.version && parsed.roots) {
                manifest.roots = parsed.roots;
            }
        } catch {
            // First run (or corrupt/older manifest) — treat as empty.
        }
        return manifest;
    }

    previousNames(root) {
        return this.roots[relative(repoRoot, root)] || [];
    }

    record(root, names) {
        this.roots[relative(repoRoot, root)] = names;
    }

    save() {
        writeFileSync(
            MANIFEST_PATH,
            `${JSON.stringify(this, null, 4)}\n`,
            'utf-8',
        );
    }
}

export function runSync() {
    if (skipConditions()) {
        return;
    }
    if (!cliAvailable()) {
        return;
    }

    // --- discovery + validation of all catalogs (rules included) ---

    const { sharedSkills, rulesSkills, localSkills } = discoverAllSkills();
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
            process.exit(FAIL_CODE);
        }
        seenNames.add(skill.name);
    }

    if (allSkills.length === 0) {
        console.log('[skills] No skills found — nothing to sync.');
        return;
    }

    // Rule-skills are validated above but not installed: they are hook-only
    // guardrails (see file header). Installed skills are everything else.
    const installedSkills = [...sharedSkills, ...localSkills];

    console.log(
        `[skills] Discovered ${allSkills.length} skill(s): ${allSkills.map((s) => s.name).join(', ')}`,
    );
    console.log(
        `[skills] Installing ${installedSkills.length} skill(s) (rules are hook-only): ${
            installedSkills.map((s) => s.name).join(', ') || '(none)'
        }`,
    );

    // --- manifest-driven reconcile (stale removal only) ---

    // Reconcile runs even when there is nothing to install today: a previous
    // sync may have installed skills that have since left the canonical tree,
    // and those stale copies are removed here regardless of the current set.
    // Only manifest-tracked names are ever removed — personal skills placed
    // by hand in the generated roots are never touched.
    const manifest = SyncManifest.load();
    const currentNames = new Set(installedSkills.map((s) => s.name));
    const ruleNames = new Set(rulesSkills.map((s) => s.name));
    for (const root of GENERATED_ROOTS) {
        if (!existsSync(root)) {
            continue;
        }
        for (const name of manifest.previousNames(root)) {
            const staleDir = join(root, name);
            if (existsSync(staleDir) && !currentNames.has(name)) {
                console.log(
                    `[skills] Removing stale skill ${relative(repoRoot, staleDir)} (no longer in canonical tree).`,
                );
                rmSync(staleDir, { recursive: true, force: true });
            }
        }
        // One-time alignment: releases before the rules-were-hook-only change
        // installed rule-skills into the roots via --skill '*'. Rules are no
        // longer installed; drop copies that a previous sync left behind. Only
        // names matching the canonical rule catalog are touched.
        for (const name of ruleNames) {
            const ruleDir = join(root, name);
            if (existsSync(ruleDir) && !currentNames.has(name)) {
                console.log(
                    `[skills] Removing rule-skills from generated root ${relative(repoRoot, ruleDir)} (rules are hook-only).`,
                );
                rmSync(ruleDir, { recursive: true, force: true });
            }
        }
    }

    if (installedSkills.length === 0) {
        console.log(
            '[skills] Nothing to install (only rule-skills found — they are hook-only).',
        );
        return;
    }

    // --- install via pinned CLI (copy mode, non-interactive) ---

    // The CLI discovers everything under the path via --full-depth, but only
    // the explicitly named skills are installed: --skill '*' would also pull
    // skills/shared/rules/* into the discovery roots, and rule-skills are
    // hook-only guardrails, not invocable capabilities. --copy avoids symlinks
    // into the gitignored .agents/skills/ canonical store; the CLI also writes
    // its own gitignored skills-lock.json.
    const cliBin = join(repoRoot, 'node_modules', '.bin', 'skills');
    try {
        const args = [
            'add',
            skillsRoot,
            '--full-depth',
            '--skill',
            ...installedSkills.map((s) => s.name),
            ...AGENT_FLAGS,
            '--copy',
            '--yes',
        ];
        console.log(`[skills] Running: skills ${args.join(' ')}`);
        execFileSync(cliBin, args, { cwd: repoRoot, stdio: 'inherit' });
    } catch {
        // Soft failure: this runs from postinstall, and a dead CLI must not
        // break `pnpm install`. `pnpm skills:sync` intentionally stays strict
        // for validation problems (frontmatter, duplicates) — only the CLI
        // dependency edge is degraded here.
        console.error(
            '[skills] WARNING: skills CLI failed. Run `pnpm skills:sync` to retry, or SKIP_SKILLS_SYNC=1 to skip.',
        );
        return;
    }

    // --- record the installed set ---

    // Only after a successful install: the manifest is the source of truth for
    // future reconciles, so a failed sync must not rewrite it away. Recorded
    // for every root unconditionally — the roots now exist by construction
    // (the CLI created them), and an empty set is still a valid record.
    for (const root of GENERATED_ROOTS) {
        manifest.record(root, [...currentNames]);
    }
    manifest.save();

    // --- validate generated filesystem ---

    /**
     * Validate that every installed skill exists at each generated root with a
     * SKILL.md, the directory name matches the skill name, and categories were
     * flattened (no shared/ or local/ subdir in the generated root).
     */
    function validateRoot(root) {
        for (const skill of installedSkills) {
            const generatedDir = join(root, skill.name);
            const generatedSkillMd = join(generatedDir, 'SKILL.md');
            if (!existsSync(generatedDir)) {
                console.error(
                    `[skills] ERROR: skill "${skill.name}" missing from generated root ${relative(repoRoot, root)}.`,
                );
                process.exit(FAIL_CODE);
            }
            if (!existsSync(generatedSkillMd)) {
                console.error(
                    `[skills] ERROR: SKILL.md missing for skill "${skill.name}" in ${relative(repoRoot, generatedDir)}.`,
                );
                process.exit(FAIL_CODE);
            }

            // Validate supporting files were preserved. README.md is
            // intentionally not required in generated output: it is often a
            // category/skill doc, not an agent-consumed asset, and the pinned
            // CLI (1.5.20) excludes only metadata.json.
            const sourceEntries = readdirSync(skill.dir, {
                withFileTypes: true,
            })
                .filter((e) => e.name !== 'SKILL.md' && e.name !== 'README.md')
                .map((e) => e.name);
            for (const entry of sourceEntries) {
                const generatedEntry = join(generatedDir, entry);
                if (!existsSync(generatedEntry)) {
                    console.error(
                        `[skills] ERROR: supporting file "${entry}" for skill "${skill.name}" missing in ${relative(repoRoot, generatedDir)}.`,
                    );
                    process.exit(FAIL_CODE);
                }
            }
        }
    }

    for (const root of GENERATED_ROOTS) {
        validateRoot(root);
    }

    // --- executable permissions check ---

    for (const skill of installedSkills) {
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
            if ((sourceMode & 0o111) === 0) {
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
                        process.exit(FAIL_CODE);
                    }
                }
            }
        }
    }

    console.log(
        `[skills] Sync complete: ${installedSkills.length} skill(s) installed to ${GENERATED_ROOTS.map((r) => relative(repoRoot, r)).join(', ')}.`,
    );
}

const isMain =
    process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    runSync();
}
