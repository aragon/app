#!/usr/bin/env node
// The app's primitive-colour lint (T-02): apps/app/biome.jsonc registers the kit's generated GritQL plugins
// (packages/gov-ui-kit/biome-plugins/primitive-colors.{js,css}.{warn,error}.grit, `pnpm lint:colors:generate` in the
// kit) as warnings for the app's sources and as errors for the module folders that reached zero findings. Same
// approach and shared helpers as the kit's own lint (packages/gov-ui-kit/scripts/lib/primitive-colors-lint.mjs).
//
//   node scripts/semanticColors/primitive-colors.mjs check    the four plugins are the kit's, warn/error scopes disjoint
//   node scripts/semanticColors/primitive-colors.mjs report   findings per module folder (src/<area>/<module>)

import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    checkScopes,
    report,
} from '../../../../packages/gov-ui-kit/scripts/lib/primitive-colors-lint.mjs';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const kitRoot = resolve(appRoot, '../../packages/gov-ui-kit');

// Module folder that owns a finding: src/<area>/<module> (src/modules/governance, src/plugins/tokenPlugin, …).
const owner = (path) => path.split('/').slice(0, 3).join('/');

const check = () => {
    const config = readFileSync(resolve(appRoot, 'biome.jsonc'), 'utf8');
    const problems = [...checkScopes(appRoot)];
    for (const language of ['js', 'css']) {
        for (const severity of ['warn', 'error']) {
            const path = `../../packages/gov-ui-kit/biome-plugins/primitive-colors.${language}.${severity}.grit`;
            if (
                !config.includes(`"${path}"`) ||
                !existsSync(resolve(appRoot, path))
            ) {
                problems.push(`biome.jsonc must register the kit's ${path}`);
            }
        }
    }
    if (problems.length > 0) {
        console.error(`primitive-colors: \n  ${problems.join('\n  ')}`);
        process.exit(1);
    }
    console.log(
        "primitive-colors: the app uses the kit's plugins, warn/error scopes disjoint",
    );
};

const [command = 'check', ...targets] = process.argv.slice(2);
switch (command) {
    case 'check':
        check();
        break;
    case 'report':
        report({
            root: appRoot,
            kitRoot,
            targets: targets.length > 0 ? targets : ['src'],
            owner,
        });
        break;
    default:
        console.error(
            `primitive-colors: unknown command "${command}" (check | report)`,
        );
        process.exit(1);
}
