/**
 * Generates slot reference documentation from source code.
 *
 * Reads enum definitions from moduleSlots.ts / moduleDaoSlots.ts files and
 * plugin registrations from plugin index.ts files, then produces:
 *   - docs/slots/governance-slots.md
 *   - docs/slots/settings-slots.md
 *   - docs/slots/create-dao-slots.md
 *   - docs/slots/application-slots.md
 *   - docs/slots/_metrics.md
 *
 * Usage:
 *   node scripts/generateSlotDocs.mjs           # generate files
 *   node scripts/generateSlotDocs.mjs --check   # exit 1 if files would change (CI mode)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DOCS_DIR = join(ROOT, 'docs/slots');
const CHECK_MODE = process.argv.includes('--check');

// ---------------------------------------------------------------------------
// 1. Source definitions
// ---------------------------------------------------------------------------

const SLOT_ENUM_SOURCES = [
    {
        file: 'src/modules/governance/constants/moduleSlots.ts',
        enumName: 'GovernanceSlotId',
        module: 'Governance',
    },
    {
        file: 'src/modules/settings/constants/moduleSlots.ts',
        enumName: 'SettingsSlotId',
        module: 'Settings',
    },
    {
        file: 'src/modules/createDao/constants/moduleSlots.ts',
        enumName: 'CreateDaoSlotId',
        module: 'Create DAO',
    },
    {
        file: 'src/modules/application/constants/moduleSlots.ts',
        enumName: 'ApplicationSlotId',
        module: 'Application',
    },
    {
        file: 'src/modules/dashboard/constants/moduleDaoSlots.ts',
        enumName: 'DashboardDaoSlotId',
        module: 'Dashboard (DAO-level)',
    },
    {
        file: 'src/modules/capitalFlow/constants/moduleDaoSlots.ts',
        enumName: 'CapitalFlowDaoSlotId',
        module: 'Capital Flow (DAO-level)',
    },
];

const PLUGIN_SOURCES = [
    {
        file: 'src/plugins/tokenPlugin/index.ts',
        name: 'tokenPlugin',
        label: 'Token Voting',
    },
    {
        file: 'src/plugins/multisigPlugin/index.ts',
        name: 'multisigPlugin',
        label: 'Multisig',
    },
    {
        file: 'src/plugins/lockToVotePlugin/index.ts',
        name: 'lockToVotePlugin',
        label: 'Lock To Vote',
    },
    {
        file: 'src/plugins/adminPlugin/index.ts',
        name: 'adminPlugin',
        label: 'Admin',
    },
    { file: 'src/plugins/sppPlugin/index.ts', name: 'sppPlugin', label: 'SPP' },
    {
        file: 'src/plugins/capitalDistributorPlugin/index.ts',
        name: 'capitalDistributorPlugin',
        label: 'Capital Distributor',
    },
    {
        file: 'src/plugins/gaugeVoterPlugin/index.ts',
        name: 'gaugeVoterPlugin',
        label: 'Gauge Voter',
    },
];

// Human-readable descriptions for slot IDs. Falls back to the ID itself if not listed.
const SLOT_DESCRIPTIONS = {
    // Governance — Members
    GOVERNANCE_DAO_MEMBER_LIST: 'Renders the member list for a DAO',
    GOVERNANCE_MEMBER_PANEL: 'Renders the member detail panel',
    GOVERNANCE_MEMBER_STATS:
        'Returns member statistics (total members, voting power, etc.)',
    // Governance — Proposals
    GOVERNANCE_DAO_PROPOSAL_LIST: 'Renders the full proposal list for a DAO',
    GOVERNANCE_DAO_PROPOSAL_LIST_ITEM: 'Renders a custom proposal list item',
    GOVERNANCE_PROCESS_PROPOSAL_STATUS:
        'Calculates the current status of a proposal',
    GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED:
        'Determines if a proposal has succeeded (reached threshold)',
    GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM:
        'Renders plugin-specific settings in the create proposal form',
    GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA:
        'Builds the transaction data for creating a proposal',
    // Governance — Voting
    GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN:
        'Renders the voting breakdown (for/against/abstain)',
    GOVERNANCE_VOTE_LIST: 'Renders the list of individual votes on a proposal',
    GOVERNANCE_SUBMIT_VOTE: 'Renders the vote submission UI',
    GOVERNANCE_BUILD_VOTE_DATA:
        'Builds the transaction data for submitting a vote',
    GOVERNANCE_PROPOSAL_VOTING_TERMINAL:
        'Renders the voting terminal (used by admin and SPP plugins)',
    GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY:
        'Renders a summary for multi-body voting',
    // Governance — Actions
    GOVERNANCE_PLUGIN_ACTIONS: 'Returns plugin-specific proposal actions',
    GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS:
        'Normalizes plugin-specific actions for display',
    // Governance — Permissions
    GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION:
        'Checks if the connected wallet can create proposals',
    GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION:
        'Checks if the connected wallet can submit votes',
    GOVERNANCE_EXECUTE_CHECK_VERSION_SUPPORTED:
        'Checks if the plugin version supports proposal execution',
    // Settings
    SETTINGS_GOVERNANCE_SETTINGS_HOOK:
        'Returns the current governance settings for a plugin',
    SETTINGS_BUILD_PREPARE_PLUGIN_UPDATE_DATA:
        'Builds the transaction data for preparing a plugin update',
    SETTINGS_PLUGIN_TO_FORM_DATA:
        'Converts plugin settings to form-compatible data for the settings editor',
    SETTINGS_GET_UNINSTALL_HELPERS:
        'Returns helper data needed for uninstalling the plugin',
    // Create DAO
    CREATE_DAO_BUILD_PREPARE_PLUGIN_INSTALL_DATA:
        'Builds the transaction data for installing the plugin during DAO creation',
    CREATE_DAO_PROCESS_BODY_READ_FIELD:
        'Renders read-only fields for the governance body configuration review step',
    CREATE_DAO_PROPOSAL_CREATION_SETTINGS:
        'Renders the proposal creation settings form during DAO setup',
    CREATE_DAO_SETUP_MEMBERSHIP:
        'Renders the membership configuration step (who can participate)',
    CREATE_DAO_SETUP_GOVERNANCE:
        'Renders the governance configuration step (voting parameters, thresholds)',
    // Application
    APPLICATION_PLUGIN_PAGE:
        'Renders a plugin-specific page at a custom URL path',
    // Dashboard DAO
    DASHBOARD_DAO_HEADER:
        'Custom header component for a specific DAO dashboard',
    // Capital Flow DAO
    CAPITAL_DISTRIBUTOR_MEMBERS_FILE_DOWNLOAD:
        'Custom member file download UI for reward distribution',
    CAPITAL_DISTRIBUTOR_VOTING_ESCROW_ADDRESS:
        'Returns the voting escrow contract address for a specific DAO',
};

// Governance slot groupings for organized output
const GOVERNANCE_GROUPS = [
    {
        heading: 'Members',
        slots: [
            'GOVERNANCE_DAO_MEMBER_LIST',
            'GOVERNANCE_MEMBER_PANEL',
            'GOVERNANCE_MEMBER_STATS',
        ],
    },
    {
        heading: 'Proposals',
        slots: [
            'GOVERNANCE_DAO_PROPOSAL_LIST',
            'GOVERNANCE_DAO_PROPOSAL_LIST_ITEM',
            'GOVERNANCE_PROCESS_PROPOSAL_STATUS',
            'GOVERNANCE_PROCESS_PROPOSAL_SUCCEEDED',
            'GOVERNANCE_CREATE_PROPOSAL_SETTINGS_FORM',
            'GOVERNANCE_BUILD_CREATE_PROPOSAL_DATA',
        ],
    },
    {
        heading: 'Voting',
        slots: [
            'GOVERNANCE_PROPOSAL_VOTING_BREAKDOWN',
            'GOVERNANCE_VOTE_LIST',
            'GOVERNANCE_SUBMIT_VOTE',
            'GOVERNANCE_BUILD_VOTE_DATA',
            'GOVERNANCE_PROPOSAL_VOTING_TERMINAL',
            'GOVERNANCE_PROPOSAL_VOTING_MULTI_BODY_SUMMARY',
        ],
    },
    {
        heading: 'Actions',
        slots: [
            'GOVERNANCE_PLUGIN_ACTIONS',
            'GOVERNANCE_PLUGIN_NORMALIZE_ACTIONS',
        ],
    },
    {
        heading: 'Permissions',
        slots: [
            'GOVERNANCE_PERMISSION_CHECK_PROPOSAL_CREATION',
            'GOVERNANCE_PERMISSION_CHECK_VOTE_SUBMISSION',
            'GOVERNANCE_EXECUTE_CHECK_VERSION_SUPPORTED',
        ],
    },
];

// ---------------------------------------------------------------------------
// 2. Parsers
// ---------------------------------------------------------------------------

function extractSlotIds(filePath) {
    const content = readFileSync(join(ROOT, filePath), 'utf-8');
    const ids = [];
    for (const match of content.matchAll(/^\s+(\w+)\s*=/gm)) {
        ids.push(match[1]);
    }
    return ids;
}

function extractRegistrations(filePath) {
    const content = readFileSync(join(ROOT, filePath), 'utf-8');
    const registrations = [];

    // Match registerSlotComponent and registerSlotFunction calls
    const pattern =
        /\.registerSlot(Component|Function)\(\{[^}]*slotId:\s*[\w.]*\.(\w+)/g;
    for (const match of content.matchAll(pattern)) {
        registrations.push({ type: match[1].toLowerCase(), slotId: match[2] });
    }

    // Also match getPageSlotId patterns for dynamic slots
    const pagePattern = /getPageSlotId\(\s*\w+\.(\w+)/g;
    for (const match of content.matchAll(pagePattern)) {
        registrations.push({ type: 'component', slotId: match[1] });
    }

    return registrations;
}

// ---------------------------------------------------------------------------
// 3. Build data model
// ---------------------------------------------------------------------------

// Parse all enums
const slotsByModule = {};
for (const source of SLOT_ENUM_SOURCES) {
    slotsByModule[source.module] = {
        ...source,
        slotIds: extractSlotIds(source.file),
    };
}

// Parse all plugin registrations
const pluginRegistrations = {};
for (const plugin of PLUGIN_SOURCES) {
    pluginRegistrations[plugin.name] = {
        ...plugin,
        registrations: extractRegistrations(plugin.file),
    };
}

// Build a map: slotId -> { type, registeredBy[] }
const slotRegistry = {};
for (const source of Object.values(slotsByModule)) {
    for (const id of source.slotIds) {
        slotRegistry[id] = { registeredBy: [], types: new Set() };
    }
}

for (const [, plugin] of Object.entries(pluginRegistrations)) {
    for (const reg of plugin.registrations) {
        if (slotRegistry[reg.slotId]) {
            slotRegistry[reg.slotId].registeredBy.push(plugin.label);
            slotRegistry[reg.slotId].types.add(reg.type);
        }
    }
}

// ---------------------------------------------------------------------------
// 4. Generators
// ---------------------------------------------------------------------------

const GENERATED_HEADER =
    '<!-- This file is auto-generated by scripts/generateSlotDocs.mjs. Do not edit manually. -->\n\n';

function slotType(id) {
    const entry = slotRegistry[id];
    if (!entry || entry.types.size === 0) {
        return '-';
    }
    const types = [...entry.types].map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
    );
    return types.join(', ');
}

function slotRegisteredBy(id) {
    const entry = slotRegistry[id];
    if (!entry || entry.registeredBy.length === 0) {
        return '-';
    }
    return entry.registeredBy.join(', ');
}

function slotDescription(id) {
    return SLOT_DESCRIPTIONS[id] ?? id;
}

function generateTable(slotIds) {
    const rows = slotIds.map(
        (id) =>
            `| \`${id}\` | ${slotType(id)} | ${slotDescription(id)} | ${slotRegisteredBy(id)} |`,
    );
    return `| Slot ID | Type | Description | Registered By |\n|---|---|---|---|\n${rows.join('\n')}`;
}

// --- governance-slots.md ---
function generateGovernanceSlots() {
    const gov = slotsByModule['Governance'];
    let md = GENERATED_HEADER;
    md += '# Governance Module Slots\n\n';
    md += `**Enum:** \`${gov.enumName}\`\n`;
    md += `**Location:** \`${gov.file}\`\n\n`;
    md += `The governance module has the largest slot surface area with ${gov.slotIds.length} slots covering members, proposals, voting, and\npermissions.\n`;

    for (const group of GOVERNANCE_GROUPS) {
        md += `\n## ${group.heading}\n\n`;
        md += generateTable(group.slots);
        md += '\n';
    }

    return md;
}

// --- settings-slots.md ---
function generateSettingsSlots() {
    const settings = slotsByModule['Settings'];
    let md = GENERATED_HEADER;
    md += '# Settings Module Slots\n\n';
    md += `**Enum:** \`${settings.enumName}\`\n`;
    md += `**Location:** \`${settings.file}\`\n\n`;
    md += `The settings module defines ${settings.slotIds.length} slots for plugin-specific governance settings, updates, and uninstallation.\n\n`;
    md += generateTable(settings.slotIds);
    md += '\n';
    return md;
}

// --- create-dao-slots.md ---
function generateCreateDaoSlots() {
    const createDao = slotsByModule['Create DAO'];
    let md = GENERATED_HEADER;
    md += '# Create DAO Module Slots\n\n';
    md += `**Enum:** \`${createDao.enumName}\`\n`;
    md += `**Location:** \`${createDao.file}\`\n\n`;
    md += `The create DAO module defines ${createDao.slotIds.length} slots used during the DAO creation wizard to configure plugins.\n\n`;
    md += generateTable(createDao.slotIds);
    md += '\n';
    return md;
}

// --- application-slots.md ---
function generateApplicationSlots() {
    const app = slotsByModule['Application'];
    const dashboard = slotsByModule['Dashboard (DAO-level)'];
    const capitalFlow = slotsByModule['Capital Flow (DAO-level)'];

    let md = GENERATED_HEADER;
    md += '# Application & DAO-Level Slots\n\n';

    md += '## Application Module Slots\n\n';
    md += `**Enum:** \`${app.enumName}\`\n`;
    md += `**Location:** \`${app.file}\`\n\n`;
    md += generateTable(app.slotIds);
    md += '\n\n';

    md += '### How Plugin Pages Work\n\n';
    md +=
        'Unlike other slots, `APPLICATION_PLUGIN_PAGE` uses **dynamic slot IDs** constructed from URL segments:\n\n';
    md += '```typescript\n';
    md += '// Registration (in plugin index.ts)\n';
    md += 'pluginRegistryUtils.registerSlotComponent({\n';
    md += '    slotId: pluginRegistryUtils.getPageSlotId(\n';
    md += '        ApplicationSlotId.APPLICATION_PLUGIN_PAGE,\n';
    md += `        [CapitalDistributorPluginPages.REWARDS],  // "rewards"\n`;
    md += '    ),\n';
    md += `    // Resulting slot ID: "APPLICATION_PLUGIN_PAGE-rewards"\n`;
    md += '    pluginId: capitalDistributorPlugin.id,\n';
    md += '    component: CapitalDistributorRewardsPage,\n';
    md += '});\n';
    md += '```\n\n';

    md +=
        'The `DaoPluginPage` server component (`src/modules/application/pages/daoPluginPage/daoPluginPage.tsx`) resolves these\n';
    md += `at render time by iterating over the DAO's installed plugins and checking which one has a registered component for the\ncurrent URL segments.\n\n`;

    md += '### Plugin Navigation Links\n\n';
    md +=
        'Plugins can add navigation links to the DAO sidebar using `pageLinksLeft` and `pageLinksRight` on their `IPluginInfo`\ndefinition:\n\n';
    md += '```typescript\n';
    md += 'export const myPlugin: IPluginInfo = {\n';
    md += '    // ... other fields\n';
    md += '    pageLinksRight: (baseUrl, context) => [\n';
    md += '        {\n';
    md += `            label: 'app.plugins.myPlugin.meta.link.dashboard',\n`;
    // biome-ignore lint/suspicious/noTemplateCurlyInString: intentional code example in markdown
    md += '            link: `${baseUrl}/dashboard`,\n';
    md += '            icon: IconType.APP_PROPOSALS,\n';
    md += `            lgHidden: context === 'dialog',\n`;
    md += '        },\n';
    md += '    ],\n';
    md += '};\n';
    md += '```\n\n';

    md += '### Current Plugin Pages\n\n';
    md += '| Plugin | Page Slug | Description |\n|---|---|---|\n';
    md +=
        '| Capital Distributor | `/rewards` | Token reward distribution management |\n';
    md += '| Gauge Voter | `/gauges` | Gauge voting interface |\n\n';

    md += '## DAO-Level Slots\n\n';
    md +=
        'DAO-level slots are different from plugin-level slots. They are scoped to **specific DAO instances** rather than plugin\n';
    md +=
        'types, and are registered from `src/daos/{daoName}/index.ts` instead of `src/plugins/`.\n\n';
    md += `Use these when a particular DAO needs custom UI that isn't tied to its plugin type.\n\n`;

    md += '### Dashboard DAO Slots\n\n';
    md += `**Enum:** \`${dashboard.enumName}\`\n`;
    md += `**Location:** \`${dashboard.file}\`\n\n`;
    md += generateTable(dashboard.slotIds);
    md += '\n\n';

    md += '### Capital Flow DAO Slots\n\n';
    md += `**Enum:** \`${capitalFlow.enumName}\`\n`;
    md += `**Location:** \`${capitalFlow.file}\`\n\n`;
    md += generateTable(capitalFlow.slotIds);
    md += '\n\n';

    md += '### How DAO Customizations Are Initialized\n\n';
    md +=
        'DAO-specific registrations are called from `src/daos/index.ts` and run as part of `initPluginRegistry()` alongside\nplugin and policy initialization:\n\n';
    md += '```\n';
    md += 'initPluginRegistry()\n';
    md += '├── initialisePlugins()           # All plugin slot registrations\n';
    md +=
        '├── initialisePolicyPluginRegistry()  # Capital flow policy resolvers\n';
    md += '└── initialiseDaos()              # DAO-specific slot overrides\n';
    md += '```\n';

    return md;
}

// --- _metrics.md ---
function generateMetrics() {
    const totalSlots = Object.keys(slotRegistry).length;
    const unregistered = Object.entries(slotRegistry)
        .filter(([, v]) => v.registeredBy.length === 0)
        .map(([id]) => id);

    let md = GENERATED_HEADER;
    md += '# Slot System Metrics\n\n';
    md +=
        '> Auto-generated snapshot of the slot system state. Run `pnpm generate:slot-docs` to refresh.\n\n';

    // Summary
    md += '## Summary\n\n';
    md += '| Metric | Value |\n|---|---|\n';
    md += `| Total slots | ${totalSlots} |\n`;
    md += `| Registered plugins | ${PLUGIN_SOURCES.length} |\n`;
    md += `| Unregistered slots | ${unregistered.length} |\n\n`;

    // Slots per module
    md += '## Slots Per Module\n\n';
    md += '| Module | Enum | Count |\n|---|---|---|\n';
    for (const source of Object.values(slotsByModule)) {
        md += `| ${source.module} | \`${source.enumName}\` | ${source.slotIds.length} |\n`;
    }
    md += '\n';

    // Plugin coverage matrix
    md += '## Plugin Coverage Matrix\n\n';
    const modules = ['Governance', 'Settings', 'Create DAO', 'Application'];
    md += `| Plugin | ${modules.join(' | ')} | Total |\n`;
    md += `|---|${modules.map(() => '---').join('|')}|---|\n`;

    for (const plugin of PLUGIN_SOURCES) {
        const counts = {};
        let total = 0;
        for (const mod of modules) {
            counts[mod] = 0;
        }
        for (const reg of pluginRegistrations[plugin.name].registrations) {
            for (const [mod, source] of Object.entries(slotsByModule)) {
                if (source.slotIds.includes(reg.slotId)) {
                    const mappedMod =
                        modules.find((m) => mod.startsWith(m)) ?? mod;
                    if (counts[mappedMod] !== undefined) {
                        counts[mappedMod]++;
                    }
                    total++;
                }
            }
        }
        const cells = modules.map((m) =>
            counts[m] > 0 ? String(counts[m]) : '-',
        );
        md += `| ${plugin.label} | ${cells.join(' | ')} | ${total} |\n`;
    }
    md += '\n';

    // Unregistered slots
    if (unregistered.length > 0) {
        md += '## Unregistered Slots\n\n';
        md +=
            'These slots are defined in enums but no plugin currently registers for them:\n\n';
        for (const id of unregistered) {
            md += `- \`${id}\`\n`;
        }
        md += '\n';
    }

    return md;
}

// ---------------------------------------------------------------------------
// 5. Write or check
// ---------------------------------------------------------------------------

const outputs = [
    { file: 'governance-slots.md', content: generateGovernanceSlots() },
    { file: 'settings-slots.md', content: generateSettingsSlots() },
    { file: 'create-dao-slots.md', content: generateCreateDaoSlots() },
    { file: 'application-slots.md', content: generateApplicationSlots() },
    { file: '_metrics.md', content: generateMetrics() },
];

let stale = false;

for (const { file, content } of outputs) {
    const filePath = join(DOCS_DIR, file);

    if (CHECK_MODE) {
        let existing = '';
        try {
            existing = readFileSync(filePath, 'utf-8');
        } catch {
            // File doesn't exist — counts as stale
        }
        if (existing !== content) {
            console.error(`Out of date: docs/slots/${file}`);
            stale = true;
        }
    } else {
        writeFileSync(filePath, content);
        console.log(`Generated: docs/slots/${file}`);
    }
}

if (CHECK_MODE && stale) {
    console.error('\nSlot docs are out of date. Run: pnpm generate:slot-docs');
    process.exit(1);
} else if (CHECK_MODE) {
    console.log('Slot docs are up to date.');
}
