import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
    mkdtempSync,
    readdirSync,
    readFileSync,
    rmSync,
    statSync,
    writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validateManifest } from './refresh.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'ds-bundle');
const appRequire = createRequire(join(ROOT, 'apps', 'app', 'package.json'));
const ts = appRequire('typescript');

function statSafe(file) {
    try {
        return statSync(file);
    } catch {
        return null;
    }
}

function filesUnder(dir) {
    if (!statSafe(dir)?.isDirectory()) {
        return [];
    }
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) =>
        a.name.localeCompare(b.name),
    )) {
        const file = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...filesUnder(file));
        } else if (entry.isFile()) {
            files.push(file);
        }
    }
    return files;
}

function generated(name) {
    const file = `${name}.d.ts`;
    const matches = filesUnder(join(OUT, 'components')).filter(
        (candidate) => basename(candidate) === file,
    );
    assert.equal(matches.length, 1, `expected one generated ${file}`);
    return matches[0];
}

function moduleSpecifier(fromDir, file) {
    const path = relative(fromDir, file)
        .split('\\')
        .join('/')
        .replace(/\.d\.ts$/, '');
    return path.startsWith('.') ? path : `./${path}`;
}

function formatDiagnostics(diagnostics) {
    return diagnostics
        .map(
            (diagnostic) =>
                `${diagnostic.file ? `${basename(diagnostic.file.fileName)}: ` : ''}${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
        )
        .join('\n');
}

test('generated App declarations compile as consumer contracts', () => {
    const wizardPage = generated('WizardPage');
    const page = generated('Page');
    const formWrapper = generated('FormWrapper');
    const addressesInput = generated('AddressesInput');
    const consumerDir = mkdtempSync(join(tmpdir(), 'app-1208-consumer-'));
    const consumer = join(consumerDir, 'consumer.ts');
    const importFromConsumer = (file) => moduleSpecifier(consumerDir, file);
    writeFileSync(
        consumer,
        `
import * as React from 'react';
import { FormWrapper } from '${importFromConsumer(formWrapper)}';
import { Page } from '${importFromConsumer(page)}';
import { WizardPage } from '${importFromConsumer(wizardPage)}';
import { AddressesInput } from '${importFromConsumer(addressesInput)}';

const step = { id: 'details', order: 0, meta: { name: 'Details' } };
React.createElement(Page.Container, {});
React.createElement(WizardPage.Container, {
  submitLabel: 'Save',
  onSubmit: () => undefined,
});
React.createElement(WizardPage.Container, { submitLabel: 'Continue' });
React.createElement(WizardPage.Step, {
  ...step,
  title: 'Details',
  description: 'Describe this step',
});
React.createElement(FormWrapper, {
  children: React.createElement('div'),
  defaultValues: { name: 'Ada' },
});
React.createElement(AddressesInput.Container, { name: 'members' });

// @ts-expect-error AddressesInput.Container must bind to a named form field.
React.createElement(AddressesInput.Container, {});

// @ts-expect-error WizardPage.Container.submitLabel is required.
React.createElement(WizardPage.Container, { onSubmit: () => undefined });
// @ts-expect-error WizardPage.Step.description is required.
React.createElement(WizardPage.Step, { ...step, title: 'Details' });
// @ts-expect-error WizardPage.Step.title is required.
React.createElement(WizardPage.Step, { ...step, description: 'Describe this step' });
// @ts-expect-error WizardPage is a compound object, not a callable component.
WizardPage({});
`,
    );

    try {
        const options = {
            allowJs: false,
            esModuleInterop: true,
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            noEmit: true,
            strict: true,
            target: ts.ScriptTarget.ES2022,
        };
        // Every App-owned declaration ships to the design consumer, so all of
        // them are checked - not only the four the fixture imports.
        const appOwned = filesUnder(join(OUT, 'components')).filter(
            (file) =>
                file.endsWith('.d.ts') &&
                readFileSync(file, 'utf8').includes('from @aragon/app@'),
        );
        assert.ok(appOwned.length >= 30, 'expected App-owned declarations');
        // The prelude inlines the App types a contract reaches. A closure that
        // starts dragging in the whole App API model shows up here first.
        const oversized = appOwned
            .map((file) => [
                basename(file),
                readFileSync(file, 'utf8').split('\n').length,
            ])
            .filter(([, lines]) => lines > 400);
        assert.deepEqual(oversized, [], 'App declarations must stay bounded');
        const host = ts.createCompilerHost(options, true);
        const appResolutionFile = join(ROOT, 'apps', 'app', 'consumer.ts');
        host.resolveModuleNames = (names, containingFile) =>
            names.map((name) => {
                const resolved = ts.resolveModuleName(
                    name,
                    containingFile,
                    options,
                    ts.sys,
                ).resolvedModule;
                return (
                    resolved ??
                    ts.resolveModuleName(
                        name,
                        appResolutionFile,
                        options,
                        ts.sys,
                    ).resolvedModule
                );
            });
        const program = ts.createProgram(
            [consumer, ...appOwned],
            options,
            host,
        );
        // node_modules diagnostics are pre-existing dependency skew in the
        // checkout, not a property of the emitted bundle.
        const diagnostics = ts
            .getPreEmitDiagnostics(program)
            .filter(
                (diagnostic) =>
                    !diagnostic.file?.fileName.includes('/node_modules/'),
            );
        assert.equal(
            diagnostics.length,
            0,
            `consumer declaration diagnostics:\n${formatDiagnostics(diagnostics)}`,
        );
    } finally {
        rmSync(consumerDir, { recursive: true, force: true });
    }
});

test('manifest validation rejects missing and stale payload files', () => {
    const out = mkdtempSync(join(tmpdir(), 'app-1208-refresh-'));
    const file = join(out, 'payload.txt');
    const entry = {
        path: 'payload.txt',
        bytes: 9,
        sha256: createHash('sha256').update('candidate').digest('hex'),
    };
    const manifest = {
        schema: 1,
        status: {
            upload: 'candidate',
            accepted: 'unknown',
            deployed: 'unknown',
        },
        payload: { upload: { files: [entry] }, 'capture/local': { files: [] } },
    };

    try {
        writeFileSync(file, 'candidate');
        assert.equal(validateManifest(manifest, out), true);
        rmSync(file);
        assert.throws(
            () => validateManifest(manifest, out),
            /missing or stale/,
        );
        writeFileSync(file, 'stale');
        assert.throws(
            () => validateManifest(manifest, out),
            /missing or stale/,
        );
    } finally {
        rmSync(out, { recursive: true, force: true });
    }
});
