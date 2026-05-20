#!/usr/bin/env node
// Shared guardrails loader: discovers rule-skills under shared and local
// roots, matches their `globs` field against the file being edited,
// and emits matched rule content in the shape an adapter asks for.
//
// Spec: .agents/skills/rules/README.md

import {
    appendFileSync,
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    realpathSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const BUFFER_RELATIVE = '.agents/metrics/.buffer.jsonl';

export const logEvents = (match, { tool, adapter, elapsed_ms, repoRoot }) => {
    try {
        const path = join(repoRoot, BUFFER_RELATIVE);
        if (!existsSync(dirname(path))) {
            mkdirSync(dirname(path), { recursive: true });
        }
        const ts = new Date().toISOString();
        const lines = match.matchedRules
            .map(
                (rule) =>
                    `${JSON.stringify({
                        ts,
                        tool,
                        file: match.relPath,
                        rule: rule.name,
                        bytes: rule.body.trim().length,
                        elapsed_ms,
                        adapter,
                    })}\n`,
            )
            .join('');
        if (lines) {
            appendFileSync(path, lines);
        }
    } catch {
        // Swallow — telemetry must never block an edit.
    }
};

export const canonicalize = (path) => {
    try {
        return realpathSync.native(path);
    } catch {
        try {
            return join(realpathSync.native(dirname(path)), basename(path));
        } catch {
            return path;
        }
    }
};

export const DEFAULT_REPO_ROOT = canonicalize(
    resolve(dirname(fileURLToPath(import.meta.url)), '..', '..'),
);
export const DEFAULT_RULE_ROOTS = [
    '.agents/skills/rules',
    '.claude/skills/rules',
];
export const TRIGGER_TOOLS = new Set(['Edit', 'Write', 'MultiEdit']);

export const parseFrontmatter = (content) => {
    const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) {
        return { meta: {}, body: content };
    }

    const meta = {};
    for (const line of match[1].split('\n')) {
        const idx = line.indexOf(':');
        if (idx === -1) {
            continue;
        }
        const key = line.slice(0, idx).trim();
        const value = line.slice(idx + 1).trim();
        meta[key] = value;
    }

    return { meta, body: match[2] };
};

export const globToRegex = (glob) => {
    let out = '^';
    for (let i = 0; i < glob.length; i++) {
        const c = glob[i];
        if (c === '*') {
            if (glob[i + 1] === '*') {
                out += '.*';
                i++;
                if (glob[i + 1] === '/') {
                    i++;
                }
            } else {
                out += '[^/]*';
            }
        } else if (c === '?') {
            out += '[^/]';
        } else if ('.+(){}[]^$|\\'.includes(c)) {
            out += `\\${c}`;
        } else {
            out += c;
        }
    }
    out += '$';
    return new RegExp(out);
};

export const pathMatches = (filePath, globsField) => {
    if (!globsField) {
        return false;
    }

    const globs = globsField
        .split(',')
        .map((glob) => glob.trim())
        .filter(Boolean);

    return globs.some((glob) => globToRegex(glob).test(filePath));
};

export const collectRules = ({
    repoRoot = DEFAULT_REPO_ROOT,
    ruleRoots = DEFAULT_RULE_ROOTS,
} = {}) => {
    const rules = [];

    for (const rootPath of ruleRoots) {
        const dir = join(repoRoot, rootPath);
        if (!existsSync(dir)) {
            continue;
        }

        for (const entry of readdirSync(dir)) {
            if (!entry.endsWith('.md') || entry === 'README.md') {
                continue;
            }

            const fullPath = join(dir, entry);
            const content = readFileSync(fullPath, 'utf8');
            const { meta, body } = parseFrontmatter(content);

            if (meta.kind !== 'rule') {
                continue;
            }

            rules.push({
                name: meta.name || entry.replace(/\.md$/, ''),
                globs: meta.globs,
                body,
                source: relative(repoRoot, fullPath),
            });
        }
    }

    return rules;
};

export const buildRuleMatch = (payload, opts = {}) => {
    const repoRoot = canonicalize(opts.repoRoot ?? DEFAULT_REPO_ROOT);
    const toolName = payload?.tool_name;
    if (!TRIGGER_TOOLS.has(toolName)) {
        return null;
    }

    const filePath = payload.tool_input?.file_path;
    if (!filePath) {
        return null;
    }

    const relPath = relative(repoRoot, canonicalize(filePath));
    const rules = collectRules({ ...opts, repoRoot });
    const matches = rules.filter((rule) => pathMatches(relPath, rule.globs));
    if (matches.length === 0) {
        return null;
    }

    const sections = matches.map(
        (rule) =>
            `<rule-skill name="${rule.name}" source="${rule.source}">\n${rule.body.trim()}\n</rule-skill>`,
    );
    const additionalContext = `Rule-skills matched against ${relPath}:\n\n${sections.join('\n\n')}`;

    return {
        relPath,
        matches: matches.map((rule) => rule.name),
        matchedRules: matches,
        additionalContext,
    };
};

export const formatHookOutput = (match, adapter = 'generic') => {
    if (!match) {
        return null;
    }

    if (adapter === 'claude') {
        return {
            hookSpecificOutput: {
                hookEventName: 'PreToolUse',
                additionalContext: match.additionalContext,
            },
        };
    }

    return {
        relPath: match.relPath,
        matches: match.matches,
        additionalContext: match.additionalContext,
    };
};

export const buildHookOutput = (payload, opts = {}) => {
    const match = buildRuleMatch(payload, opts);
    return match
        ? {
              ...match,
              output: formatHookOutput(match, opts.adapter),
          }
        : null;
};

// Backward-compatible export for existing Claude-focused tests/integrations.
export const buildAdditionalContext = (payload, opts = {}) =>
    buildHookOutput(payload, { ...opts, adapter: 'claude' });

const readStdin = () =>
    new Promise((resolveInput) => {
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk) => {
            data += chunk;
        });
        process.stdin.on('end', () => resolveInput(data));
    });

export const parseCliArgs = (argv) => {
    const options = {
        adapter: undefined,
        toolName: 'Edit',
        ruleRoots: [],
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        const [flag, inlineValue] = arg.split('=', 2);
        const value = inlineValue ?? argv[i + 1];

        if (flag === '--adapter' && value) {
            options.adapter = value;
            if (inlineValue == null) {
                i++;
            }
            continue;
        }

        if (flag === '--tool' && value) {
            options.toolName = value;
            if (inlineValue == null) {
                i++;
            }
            continue;
        }

        if (flag === '--file' && value) {
            options.filePath = value;
            if (inlineValue == null) {
                i++;
            }
            continue;
        }

        if (flag === '--repo-root' && value) {
            options.repoRoot = value;
            if (inlineValue == null) {
                i++;
            }
            continue;
        }

        if (flag === '--rule-root' && value) {
            options.ruleRoots.push(value);
            if (inlineValue == null) {
                i++;
            }
        }
    }

    return options;
};

const buildPayloadFromCli = ({ filePath, toolName }) =>
    filePath
        ? {
              tool_name: toolName,
              tool_input: { file_path: filePath },
          }
        : null;

export const main = async ({ defaultAdapter = 'generic' } = {}) => {
    try {
        const raw = await readStdin();
        const cli = parseCliArgs(process.argv.slice(2));
        const payload = raw.trim() ? JSON.parse(raw) : buildPayloadFromCli(cli);

        if (!payload) {
            process.exit(0);
        }

        const adapter = cli.adapter || defaultAdapter;
        const repoRoot = canonicalize(cli.repoRoot ?? DEFAULT_REPO_ROOT);
        const start = Date.now();
        const result = buildHookOutput(payload, {
            adapter,
            repoRoot: cli.repoRoot,
            ruleRoots: cli.ruleRoots.length > 0 ? cli.ruleRoots : undefined,
        });
        const elapsed_ms = Date.now() - start;

        if (result) {
            logEvents(result, {
                tool: payload.tool_name,
                adapter,
                elapsed_ms,
                repoRoot,
            });
            process.stdout.write(JSON.stringify(result.output));
        }
    } catch (err) {
        process.stderr.write(`inject-rules hook error: ${err.message}\n`);
    }

    process.exit(0);
};

const isMain =
    process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
    main();
}
