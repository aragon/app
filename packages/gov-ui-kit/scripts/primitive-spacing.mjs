#!/usr/bin/env node
// Lint support for the semantic spacing layer (src/theme/tokens/spacing.css): padding, margin, gap and space take a
// spacing role (`px-inset-item`, `gap-group`, `mt-related`), a component size (`px-control-md`) or a documented
// `<family>-<role>--<pattern>` exception instead of a raw Tailwind number. The checks themselves are Biome GritQL
// plugins, wired in the kit's and the app's `biome.jsonc`; this script owns their pattern, so the four plugin files
// (JS/CSS x warn/error) cannot drift apart.
//
//   node scripts/primitive-spacing.mjs generate           rewrite biome-plugins/primitive-spacing.*.grit
//   node scripts/primitive-spacing.mjs check              fail if a plugin file is stale, a warn/error scope overlaps,
//                                                         an allowlisted file is not excluded from both scopes, or an
//                                                         allowlisted file holds more than its allowed classes
//   node scripts/primitive-spacing.mjs report [<root>]    findings per folder (root: the kit, or e.g. ../../apps/app)
//
// Flagged, with any variant prefix, the negative sign and the important modifier: numeric and arbitrary values of the
// padding (`p px py pt pb pl pr ps pe`), margin (`m mx my mt mb ml mr ms me`), gap (`gap gap-x gap-y`) and space
// (`space-x space-y`) utilities: `p-4`, `md:gap-x-2.5`, `-ml-1`, `p-px`, `pt-[72px]`, `mt-(--offset)`. Not flagged:
// zero (`p-0`, `gap-0`, `space-y-0`), `auto` margins, and every role, size and exception utility.
//
// Allowlist (spacing.decisions.md, "Allowlist"): geometry (avatar-stack overlaps, the frame padding of icon- and
// avatar-only buttons, optical nudges that follow a line height, the room kept for an absolute close button) and the
// few places the change budget of New leaves outside every role. Each allowlisted file is excluded from both plugins
// in biome.jsonc and listed below with the exact classes it may hold; `check` fails when such a file holds any other
// raw spacing class.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const kitRoot = resolve(fileURLToPath(import.meta.url), '../..');
const repoRoot = resolve(kitRoot, '../..');

// One raw spacing class: optional variants (`md:`, `first:`, `[&>a]:`), optional `!`, optional `-`, a family, and a
// numeric (not zero), `px`, arbitrary or custom-property value.
const VARIANTS = String.raw`(?:[\w\-\[\]&>:.*/()=,#%@'\x22]*:)?`;
const FAMILY = '(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|space-[xy])';
const VALUE = String.raw`(?:0\.\d+|[1-9]\d*(?:\.\d+)?|px|\[[^\]\s]+\]|\([^)\s]+\))`;
const CLASS = `!?-?${FAMILY}-${VALUE}!?`;
// Grit regexes are Rust regexes matched against the whole node text (no lookaround), so the delimiters are consumed.
const CORE = String.raw`(?:^|[\s'\x22\x60{])${VARIANTS}${CLASS}(?:[\s'\x22\x60}]|$)`;
const tokenRegex = new RegExp(String.raw`(?:^|(?<=[\s'\x22\x60{]))${VARIANTS}${CLASS}(?=[\s'\x22\x60}]|$)`, 'g');

const avatarStackOverlap = /^(?:(?:sm|md|lg|xl|2xl):)?-ml-(?:1|1\.5|2|2\.5|3|4)$/;

// Three kinds of entries, each with its reason (spacing.decisions.md, section "Allowlist"):
// - geometry: numbers that follow a shape, not a spacing job (overlaps, button frames, line-height alignment, room
//   for an absolute control, offsets that centre a control on a field);
// - outlier: places the decision 0 budget of New leaves outside every role (no role's New value within 4 px, 8 px
//   above 24 px, and fewer than 10 places share the pattern): they keep Today in every mode, open for the owner;
// - devtools: the debug panel, never shown to users.
const app = 'apps/app/src';
const kit = 'packages/gov-ui-kit/src';
const entry = (kind, reason, classes) => ({ kind, reason, classes });
export const allowlist = {
    [`${kit}/core/components/avatars/avatarStack/avatarStack.tsx`]: entry(
        'geometry',
        'the avatar overlap follows the avatar size at every breakpoint (O-04)',
        avatarStackOverlap,
    ),
    [`${kit}/core/components/dialogs/dialog/dialogHeader/dialogHeader.tsx`]: entry(
        'geometry',
        'the title keeps room for the absolute close button (surface inset + button); the close button frame (R-06)',
        /^(?:pr-14|md:pr-16|p-1)$/,
    ),
    [`${kit}/core/components/dataList/dataListFilter/dataListFilter.tsx`]: entry(
        'geometry',
        'frame of the search clear button and of the spinner slot (R-06)',
        /^(?:p-2\.5|m-1)$/,
    ),
    [`${kit}/core/components/forms/inputFileAvatar/inputFileAvatar.tsx`]: entry(
        'geometry',
        'frame of the image remove button (R-06)',
        /^p-1$/,
    ),
    [`${kit}/core/components/forms/switch/switch.tsx`]: entry('geometry', 'the switch track around its thumb', /^p-1$/),
    [`${kit}/core/components/forms/checkboxCard/checkboxCard.tsx`]: entry(
        'geometry',
        'the indicator aligns with the first text line (2 px, 4 px from md, with the line height)',
        /^(?:mt-0\.5|md:mt-1)$/,
    ),
    [`${kit}/core/components/forms/radioCard/radioCard.tsx`]: entry(
        'outlier',
        'label to tag gap 2 px on phones, 16 px from md: no role within the budget',
        /^(?:gap-x-0\.5|md:gap-x-4)$/,
    ),
    [`${kit}/core/components/states/emptyState/emptyState.tsx`]: entry(
        'outlier',
        'stacked empty state 24 px, 48 px from md: no role within the budget',
        /^(?:p-6|md:p-12)$/,
    ),
    [`${kit}/modules/components/wallet/wallet.tsx`]: entry(
        'geometry',
        'frame of the avatar-only wallet button (R-06)',
        /^p-1$/,
    ),
    [`${kit}/modules/components/proposal/proposalActions/proposalActionsDecoder/proposalActionsDecoderField/proposalActionsDecoderField.tsx`]:
        entry('geometry', 'centres the small delete button on the large field ((48 - 32) / 2)', /^mt-2$/),
    [`${kit}/theme/utils/prose.css`]: entry(
        'outlier',
        'markdown blockquote 40 px: no inset role within the budget',
        /^p-10$/,
    ),
    [`${app}/daos/aragonDemo/components/aragonDemoPageHeader/aragonDemoPageHeader.tsx`]: entry(
        'outlier',
        'DAO-branded page header (40/16 px, 64 px from md): no role within the budget',
        /^(?:pt-10|pb-4|md:py-16)$/,
    ),
    [`${app}/daos/aragonDemoPolicies/components/aragonDemoPoliciesPageHeader/aragonDemoPoliciesPageHeader.tsx`]: entry(
        'outlier',
        'DAO-branded page header (40/16 px, 64 px from md): no role within the budget',
        /^(?:pt-10|pb-4|md:py-16)$/,
    ),
    [`${app}/daos/boundless/components/boundlessPageHeader/boundlessAvatarIcon.tsx`]: entry(
        'geometry',
        'a 1 px ring around the avatar (optical, O-04)',
        /^p-\[1px\]$/,
    ),
    [`${app}/daos/boundless/components/boundlessPageHeader/boundlessPageHeader.tsx`]: entry(
        'outlier',
        'DAO-branded page header (16 -> 48 gap, 24 -> 64 / 16 -> 40 padding): no role within the budget',
        /^(?:gap-y-4|pt-6|pb-4|md:gap-y-12|md:pt-16|md:pb-10)$/,
    ),
    [`${app}/daos/cryptex/components/cryptexPageHeader/cryptexPageHeader.tsx`]: entry(
        'outlier',
        'DAO-branded page header (16 -> 48 gap, 24 -> 64 / 16 -> 40 padding): no role within the budget',
        /^(?:gap-y-4|pt-6|pb-4|md:gap-y-12|md:pt-16|md:pb-10)$/,
    ),
    [`${app}/modules/application/components/debugPanel/debugPanel.tsx`]: entry(
        'devtools',
        'the debug panel (feature flag debugPanel), never shown to users',
        /^(?:gap-2|gap-4|px-4|py-2)$/,
    ),
    [`${app}/modules/application/components/debugPanel/workspaceRegistryControls.tsx`]: entry(
        'devtools',
        'the debug panel (feature flag debugPanel), never shown to users',
        /^gap-2$/,
    ),
    [`${app}/modules/application/components/navigations/navigationDao/navigationDaoHome.tsx`]: entry(
        'geometry',
        'frame of the DAO avatar button (R-06; the label padding is control padding)',
        /^p-1$/,
    ),
    [`${app}/modules/application/components/navigations/navigationSidebarAccount/navigationSidebarAccount.tsx`]: entry(
        'geometry',
        'frame of the account avatar button (R-06)',
        /^p-2$/,
    ),
    [`${app}/modules/application/components/navigations/navigationWizard/navigationWizard.tsx`]: entry(
        'geometry',
        'frame of the icon-only exit link (R-06)',
        /^p-4$/,
    ),
    [`${app}/modules/application/components/navigations/navigationWorkspace/navigationWorkspace.tsx`]: entry(
        'geometry',
        'frame of the workspace avatar button (R-06) and the overlap of the stacked chevrons',
        /^(?:py-1\.5|pl-1\.5|md:py-2|md:pl-2|-space-y-1)$/,
    ),
    [`${app}/modules/application/pages/landingPage/landingPage.tsx`]: entry(
        'outlier',
        'the landing composition (24 -> 48 -> 72 px gutters at the viewport edges): no role within the budget',
        /^(?:px-6|pt-6|pb-5|md:px-12|md:py-12|xl:px-\[72px\]|md:pl-12|xl:pl-\[72px\])$/,
    ),
    [`${app}/modules/capitalFlow/components/dispatchPanel/dispatchPanel.tsx`]: entry(
        'geometry',
        'indent of the description to the title text past its icon (icon + gap)',
        /^pl-9$/,
    ),
    [`${app}/modules/capitalFlow/dialogs/dispatchDialog/dispatchSimulationDialog.tsx`]: entry(
        'geometry',
        '2 px optical nudge of the warning icon to the first text line (O-04)',
        /^mt-0\.5$/,
    ),
    [`${app}/modules/capitalFlow/dialogs/setupStrategyDialog/setupStrategyDialogDistributionRecipients/setupStrategyDialogDistributionRecipientItem.tsx`]:
        entry('geometry', 'aligns the remove button with the field top', /^pt-1$/),
    [`${app}/modules/capitalFlow/dialogs/setupStrategyDialog/setupStrategyDialogDistributionStream/setupStrategyDialogDistributionStreamRecipientItem.tsx`]:
        entry('geometry', 'aligns the remove button with the field top', /^pt-1$/),
    [`${app}/modules/createDao/components/createProcessForm/createProcessFormGovernance/fields/governanceStagesField/governanceStagesField.tsx`]:
        entry('outlier', 'stage card 16 px, 48 px from md: no role within the budget', /^(?:p-4|md:p-12)$/),
    [`${app}/modules/createDao/components/createProcessForm/createProcessFormProposalCreation/existingConditionCard.tsx`]:
        entry(
            'geometry',
            'centres the small remove button on the large field in the row layout ((48 - 32) / 2)',
            /^sm:mt-2$/,
        ),
    [`${app}/modules/explore/pages/exploreDaosPage/exploreDaosPageClient.tsx`]: entry(
        'outlier',
        'the explore hero pulled up by the header height (geometry, O-04) and its 40 -> 48 / 40 -> 64 / 40 -> 80 section paddings (no role within the budget)',
        /^(?:mt-\[-72px\]|pt-\[72px\]|md:-mt-24|md:pt-24|py-10|md:px-6|md:py-12|pt-10|md:pt-16|pb-16|md:py-20)$/,
    ),
    [`${app}/modules/workspace/components/createWorkspaceForm/createWorkspaceFormAccounts/createWorkspaceFormAccountsItem.tsx`]:
        entry('geometry', 'aligns the menu button with the field below the label in the row layout (md)', /^md:mt-9$/),
    [`${app}/modules/workspace/components/createWorkspaceForm/createWorkspaceFormTargets/createWorkspaceFormTargetsItem.tsx`]:
        entry('geometry', 'aligns the menu button with the field below the label in the row layout (md)', /^md:mt-9$/),
    [`${app}/shared/components/forms/resourcesInput/resourcesInputItem.tsx`]: entry(
        'geometry',
        'aligns the remove button with the field below the label in the row layout (md)',
        /^md:mt-9$/,
    ),
    [`${app}/modules/workspace/components/workspaceAccountSelector/workspaceAccountSelector.tsx`]: entry(
        'geometry',
        'frame of the account avatar trigger (R-06)',
        /^p-2$/,
    ),
    [`${app}/modules/workspace/components/workspaceSelector/workspaceSelector.tsx`]: entry(
        'geometry',
        'frame of the workspace avatar trigger (R-06)',
        /^p-2$/,
    ),
    [`${app}/modules/workspace/components/workspaceAccountStateCard/workspaceAccountStateCard.tsx`]: entry(
        'outlier',
        'empty-state card 40 px: no inset role within the budget',
        /^py-10$/,
    ),
    [`${app}/modules/workspace/pages/workspaceDetailsPage/workspaceDetailsPageClient.tsx`]: entry(
        'outlier',
        'empty-state card 40 px: no inset role within the budget',
        /^py-10$/,
    ),
    [`${app}/plugins/gaugeVoterPlugin/components/gaugeVoterVotingTerminal/gaugeVoterVotingTerminal.tsx`]: entry(
        'geometry',
        'the sticky terminal bleeds past the column from lg',
        /^lg:-mx-4$/,
    ),
    [`${app}/plugins/gaugeVoterPlugin/dialogs/gaugeVoterVoteDialog/gaugeVoterVoteDialogItem/gaugeVoterVoteDialogItem.tsx`]:
        entry('geometry', 'room for the absolute remove button on phones', /^pr-10$/),
    [`${app}/plugins/lockToVotePlugin/components/lockToVoteSetupGovernance/lockToVoteSetupGovernance.tsx`]: entry(
        'outlier',
        'field gap 24 px, 12 px from md: no role within the budget',
        /^(?:gap-6|md:gap-3)$/,
    ),
    [`${app}/plugins/tokenPlugin/components/tokenSetupGovernance/tokenSetupGovernance.tsx`]: entry(
        'outlier',
        'field gap 24 px, 12 px from md: no role within the budget',
        /^(?:gap-6|md:gap-3)$/,
    ),
    [`${app}/plugins/safeMultisigPlugin/components/safeMultisigSubmitVote/safeMultisigSubmitVote.tsx`]: entry(
        'geometry',
        'pulls the alerts into the section gap above them (24 - 16)',
        /^-mt-4$/,
    ),
    [`${app}/shared/components/banner/banner.tsx`]: entry(
        'geometry',
        'icon nudge to the first text line and the action indent past the icon (icon + gap), both until lg',
        /^(?:mt-1|ml-7)$/,
    ),
    [`${app}/shared/components/container/container.tsx`]: entry(
        'outlier',
        'the 40 px gutter between lg and xl: no inset role within the budget',
        /^lg:px-10$/,
    ),
    [`${app}/shared/components/forms/addressesInput/addressesInputItem/addressesInputItem.tsx`]: entry(
        'geometry',
        'centres the small remove button on the large field in the row layout ((48 - 32) / 2)',
        /^sm:mt-2$/,
    ),
    [`${app}/shared/components/forms/autocompleteInput/autocompleteInputItem.tsx`]: entry(
        'geometry',
        'keeps room for the check icon of the active item (icon + gap)',
        /^mr-7$/,
    ),
    [`${app}/shared/components/forms/autocompleteInput/autocompleteInputMenu.tsx`]: entry(
        'geometry',
        'the menu runs under the field it is attached to (the field height, 48 px)',
        /^(?:md:pb-12|md:pt-12)$/,
    ),
    [`${app}/shared/components/navigation/navigationTrigger/navigationTrigger.tsx`]: entry(
        'geometry',
        'frame of the menu trigger (R-06)',
        /^p-\[3px\]$/,
    ),
    [`${app}/shared/components/page/pageContent/pageContent.tsx`]: entry(
        'outlier',
        'page column gap 40 -> 64 -> 40 -> 64 px (md, lg, xl) and the 80 px page bottom: no role within the budget',
        /^(?:gap-10|pb-20|md:gap-16|lg:gap-10|xl:gap-16)$/,
    ),
    [`${app}/shared/components/page/pageHeader/pageHeader.tsx`]: entry(
        'outlier',
        'page header gaps 40 -> 64 -> 40 -> 64 px (md, lg, xl): no role within the budget',
        /^(?:gap-10|md:gap-16|lg:gap-10|xl:gap-16)$/,
    ),
    [`${app}/shared/components/page/pageMain/pageMain.tsx`]: entry(
        'outlier',
        'the full-width page main 24 px top and 40 -> 80 px bottom: no role within the budget',
        /^(?:pt-6|pb-10|md:pb-20)$/,
    ),
    [`${app}/shared/components/transactionStatus/transactionStatusStep/transactionStatusStep.tsx`]: entry(
        'geometry',
        '2 px frame that gives the spinner the icon size (O-04)',
        /^p-0\.5$/,
    ),
    [`${app}/shared/components/wizardDetailsDialog/wizardDetailsDialog.tsx`]: entry(
        'outlier',
        'wizard intro dialog 48 -> 24 px horizontal and 40 px vertical inset: no role within the budget',
        /^(?:px-12|py-10|md:px-6)$/,
    ),
};

const pluginFile = (language, severity) =>
    resolve(kitRoot, `biome-plugins/primitive-spacing.${language}.${severity}.grit`);
const message =
    'Raw spacing class: use a spacing role from src/theme/tokens/spacing.css instead (px-inset-item, gap-group, ' +
    'mt-related, px-control-md, or a documented <family>-<role>--<pattern> exception).';

const fail = (text) => {
    console.error(`primitive-spacing: ${text}`);
    process.exit(1);
};

const render = (language, severity) => {
    const nodes =
        language === 'js'
            ? ['JsStringLiteralExpression()', 'JsTemplateChunkElement()', 'JsxString()', 'JsLiteralMemberName()']
            : ['TwApplyAtRule()'];
    return [
        '// Generated by scripts/primitive-spacing.mjs — do not edit by hand.',
        `// Flags raw spacing classes (${language === 'js' ? 'string literals, JSX strings, template chunks and object keys' : '@apply lines'}).`,
        `language ${language}`,
        '',
        ...(nodes.length === 1
            ? [`or { ${nodes[0]} } as $node where {`]
            : ['or {', nodes.map((node) => `    ${node}`).join(',\n'), '} as $node where {']),
        `    $node <: r"(?s).*${CORE}.*",`,
        `    register_diagnostic(span=$node, message="${message}", severity="${severity}")`,
        '}',
        '',
    ].join('\n');
};

const generated = () =>
    ['js', 'css'].flatMap((language) =>
        ['warn', 'error'].map((severity) => ({
            file: pluginFile(language, severity),
            content: render(language, severity),
        })),
    );

// Raw spacing classes of a source file: every class-shaped token inside a string literal (CSS: @apply lines).
export const findingsOf = (text, isCss) => {
    const chunks = isCss
        ? [...text.matchAll(/@apply\s+([^;]+);/g)].map((m) => [m[1], m.index])
        : [...text.matchAll(/'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`/g)].map((m) => [m[1] ?? m[2] ?? m[3] ?? '', m.index]);
    const found = [];
    for (const [chunk, index] of chunks) {
        for (const match of chunk.matchAll(tokenRegex)) {
            found.push({ token: match[0], line: text.slice(0, index).split('\n').length });
        }
    }
    return found;
};

const SKIP = /\.(test|spec|stories)\.tsx?$|\/__mocks__\/|\.d\.ts$/;
const walk = (dir, out = []) => {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
            if (name !== 'node_modules' && name !== '.next' && name !== 'tokens') {
                walk(path, out);
            }
        } else if (/\.(tsx?|css)$/.test(name) && !SKIP.test(path)) {
            out.push(path);
        }
    }
    return out;
};

const checkAllowlist = () => {
    const problems = [];
    for (const [file, { classes }] of Object.entries(allowlist)) {
        const text = readFileSync(resolve(repoRoot, file), 'utf8');
        for (const { token, line } of findingsOf(text, file.endsWith('.css'))) {
            if (!classes.test(token.replaceAll('!', ''))) {
                problems.push(`${file}:${line} holds ${token}, which its allowlist entry does not allow`);
            }
        }
    }
    return problems;
};

// Warn and error scopes of each plugin pair must be disjoint, and allowlisted files excluded from both.
const checkScopes = () => {
    const problems = [];
    for (const config of ['packages/gov-ui-kit/biome.jsonc', 'apps/app/biome.jsonc']) {
        const text = readFileSync(resolve(repoRoot, config), 'utf8').replace(/^\s*\/\/.*$/gm, '');
        const plugins = JSON.parse(text).plugins ?? [];
        for (const language of ['js', 'css']) {
            const find = (severity) =>
                plugins.find((p) => p.path.endsWith(`primitive-spacing.${language}.${severity}.grit`));
            const [warn, error] = [find('warn'), find('error')];
            if (warn == null || error == null) {
                problems.push(`${config}: the ${language} warn and error spacing plugins must both be configured`);
                continue;
            }
            // Disjoint when every positive glob of one plugin is negated in the other (either direction).
            const positives = (plugin) => (plugin.includes ?? []).filter((glob) => !glob.startsWith('!'));
            const negatedIn = (globs, plugin) => globs.every((glob) => (plugin.includes ?? []).includes(`!${glob}`));
            if (!negatedIn(positives(warn), error) && !negatedIn(positives(error), warn)) {
                problems.push(
                    `${config}: the ${language} warn and error scopes overlap (negate one plugin's globs in the other)`,
                );
            }
            for (const file of Object.keys(allowlist).filter((f) => config.startsWith(f.split('/src/')[0]))) {
                const local = `!${relative(resolve(repoRoot, config, '..'), resolve(repoRoot, file))}`;
                for (const plugin of [warn, error]) {
                    if (!(plugin.includes ?? []).includes(local)) {
                        problems.push(`${config}: allowlisted ${local.slice(1)} must be excluded from ${plugin.path}`);
                    }
                }
            }
        }
    }
    return problems;
};

const check = () => {
    const stale = generated().filter(({ file, content }) => {
        try {
            return readFileSync(file, 'utf8') !== content;
        } catch {
            return true;
        }
    });
    const problems = [
        ...stale.map(({ file }) => `${relative(kitRoot, file)} is stale: run \`pnpm lint:spacing:generate\``),
        ...checkScopes(),
        ...checkAllowlist(),
    ];
    if (problems.length > 0) {
        fail(`\n  ${problems.join('\n  ')}`);
    }
    console.log('primitive-spacing: plugins up to date, warn/error scopes disjoint, allowlist respected');
};

const report = (rootArg) => {
    const root = resolve(kitRoot, rootArg ?? '.');
    const files = walk(resolve(root, 'src'));
    const byFolder = new Map();
    let total = 0;
    for (const file of files) {
        const rel = relative(repoRoot, file);
        if (Object.hasOwn(allowlist, rel)) {
            continue;
        }
        const found = findingsOf(readFileSync(file, 'utf8'), file.endsWith('.css'));
        if (found.length === 0) {
            continue;
        }
        total += found.length;
        const folder = relative(root, file).split('/').slice(0, 4).join('/');
        byFolder.set(folder, [
            ...(byFolder.get(folder) ?? []),
            ...found.map((f) => `${relative(root, file)}:${f.line} ${f.token}`),
        ]);
    }
    for (const [folder, items] of [...byFolder].sort()) {
        console.log(`${folder} (${items.length})`);
        for (const item of items) {
            console.log(`    ${item}`);
        }
    }
    console.log(
        `primitive-spacing: ${total} findings in ${byFolder.size} folders of ${relative(repoRoot, root) || '.'}`,
    );
};

if (import.meta.main) {
    const [command = 'check', target] = process.argv.slice(2);
    switch (command) {
        case 'generate':
            for (const { file, content } of generated()) {
                writeFileSync(file, content);
                console.log(`primitive-spacing: wrote ${relative(kitRoot, file)}`);
            }
            break;
        case 'check':
            check();
            break;
        case 'report':
            report(target);
            break;
        default:
            fail(`unknown command "${command}" (generate | check | report)`);
    }
}
