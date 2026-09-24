import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
    appendFile,
    mkdir,
    mkdtemp,
    readFile,
    rm,
    writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import {
    buildRegistry,
    extractExports,
    validateRegistry,
} from './registry.mjs';

const componentDirectory = path.dirname(new URL(import.meta.url).pathname);
const kitRoot = path.resolve(
    process.env.GOVKIT_KIT_ROOT ||
        path.join(componentDirectory, '../../gov-ui-kit'),
);
if (!existsSync(path.join(kitRoot, 'package.json'))) {
    throw new Error(
        `GovKit source checkout not found at ${kitRoot}; set GOVKIT_KIT_ROOT`,
    );
}
const optionsFor = (appRoot, registryPath) => ({
    appRoot,
    kitRoot,
    consumedRoot: path.join(appRoot, 'node_modules', '@aragon', 'gov-ui-kit'),
    registryPath,
});

async function makeFixture() {
    const appRoot = await mkdtemp(path.join(tmpdir(), 'govkit-registry-'));
    await mkdir(path.join(appRoot, 'src', 'shared', 'lib', '@aragon'), {
        recursive: true,
    });
    await writeFile(
        path.join(appRoot, 'src', 'shared', 'lib', '@aragon', 'gov-ui-kit.ts'),
        "export * from '@aragon/gov-ui-kit-original';\n",
    );
    await writeFile(
        path.join(appRoot, 'package.json'),
        JSON.stringify({
            name: 'registry-fixture',
            dependencies: { '@aragon/gov-ui-kit': 'catalog:' },
        }),
    );
    await writeFile(
        path.join(appRoot, 'src', 'view.tsx'),
        `import { AddressInput as UnusedAddressInput, Button as SaveButton, Dialog, ProposalVoting, Tabs } from '@aragon/gov-ui-kit';
import '@aragon/gov-ui-kit/index.css';
const LocalButton = () => <span>local</span>;
export const View = () => <Dialog.Root><Tabs.Root><ProposalVoting.Progress.Container><SaveButton>Save</SaveButton><LocalButton /></ProposalVoting.Progress.Container></Tabs.Root></Dialog.Root>;
export const Shadow = ({ SaveButton }) => <SaveButton />;
`,
    );
    await writeFile(
        path.join(appRoot, 'src', 'view.test.tsx'),
        `import type { IButtonProps } from '@aragon/gov-ui-kit';
export const testProps: IButtonProps | undefined = undefined;
`,
    );
    await writeFile(
        path.join(appRoot, 'src', 'view.stories.tsx'),
        `import { Button } from '@aragon/gov-ui-kit';
export const Story = () => <Button>Story</Button>;
`,
    );
    await writeFile(
        path.join(appRoot, 'src', 'view.css'),
        "/* @import '@aragon/gov-ui-kit/build.css'; */\n@import './node_modules/@aragon/gov-ui-kit/index.css';\n",
    );
    return appRoot;
}

test('distinguishes nested compounds from callable contexts and enums', () => {
    const extracted = extractExports(kitRoot);
    const proposalVoting = extracted.records.find(
        (record) => record.name === 'ProposalVoting',
    );
    const progress = proposalVoting?.members.find(
        (member) => member.name === 'ProposalVoting.Progress',
    );
    assert.equal(progress?.id, 'govkit:ProposalVotingProgress');
    assert.equal(
        extracted.records.find((record) => record.name === 'TabsContext')?.kind,
        'non-component',
    );
    assert.equal(
        extracted.records.find((record) => record.name === 'IconType')?.kind,
        'non-component',
    );
});

test('refreshes isolated fixtures while preserving intent and marking stale evidence', async () => {
    const appRoot = await makeFixture();
    const registryPath = path.join(appRoot, 'registry.json');
    const options = optionsFor(appRoot, registryPath);
    try {
        const initial = buildRegistry({ ...options, preserveCurated: false });
        const button = initial.components.find(
            (record) => record.name === 'Button',
        );
        assert.ok(button);
        assert.equal(button.usage.found, true);
        const productionViewRef = button.usage.refs.find(
            (ref) =>
                ref.path === 'src/view.tsx' &&
                ref.usageType === 'production' &&
                ref.kind === 'jsx',
        );
        assert.ok(productionViewRef);
        assert.deepEqual(
            button.usage.refs
                .filter(
                    (ref) => ref.path === 'src/view.tsx' && ref.kind === 'jsx',
                )
                .map((ref) => ref.localName),
            ['SaveButton'],
        );
        const buttonProps = initial.components.find(
            (record) => record.name === 'IButtonProps',
        );
        assert.ok(
            buttonProps?.usage.refs.some(
                (ref) => ref.usageType === 'test' && ref.kind === 'type',
            ),
        );
        const proposalVoting = initial.components.find(
            (record) => record.name === 'ProposalVoting',
        );
        assert.ok(
            proposalVoting?.usage.refs.some(
                (ref) => ref.localName === 'ProposalVoting',
            ),
        );
        const progressContainer = initial.components.find(
            (record) => record.name === 'ProposalVotingProgressContainer',
        );
        assert.ok(
            progressContainer?.usage.refs.some(
                (ref) => ref.localName === 'ProposalVoting.Progress.Container',
            ),
        );
        assert.ok(
            button.usage.refs.some(
                (ref) => ref.usageType === 'story' && ref.kind === 'jsx',
            ),
        );
        const addressInput = initial.components.find(
            (record) => record.name === 'AddressInput',
        );
        assert.equal(addressInput?.usage.refs.length, 0);
        const cssRecord = initial.components.find(
            (record) => record.name === 'index.css',
        );
        assert.equal(cssRecord?.kind, 'css');
        assert.ok(
            cssRecord.usage.refs.some((ref) => ref.path === 'src/view.tsx'),
        );
        assert.ok(
            cssRecord.usage.refs.some(
                (ref) => ref.path === 'src/view.css' && ref.line === 2,
            ),
        );
        assert.equal(
            initial.components.find((record) => record.name === 'build.css')
                .usage.found,
            false,
        );
        assert.equal(initial.provenance.app.commit, null);
        assert.equal(initial.provenance.consumed.lock.version, null);
        const curated = structuredClone(initial);
        const curatedButton = curated.components.find(
            (record) => record.name === 'Button',
        );
        curatedButton.intent.description = 'Preserved fixture intent';
        const {
            repository,
            path: evidencePath,
            line,
            sha256,
        } = productionViewRef;
        curatedButton.intent.evidence = [
            { repository, path: evidencePath, line, sha256 },
        ];
        curatedButton.intent.stale = false;
        await writeFile(registryPath, JSON.stringify(curated));
        await appendFile(
            path.join(appRoot, 'src', 'view.tsx'),
            '\n// changed fixture source\n',
        );

        const refreshed = buildRegistry(options);
        const refreshedButton = refreshed.components.find(
            (record) => record.name === 'Button',
        );
        assert.equal(
            refreshedButton.intent.description,
            'Preserved fixture intent',
        );
        assert.equal(refreshedButton.intent.evidence[0].sha256, sha256);
        assert.equal(
            refreshedButton.intent.evidenceStatus[0].expectedSha256,
            sha256,
        );
        assert.equal(
            refreshedButton.intent.evidenceStatus[0].status,
            'changed',
        );
        assert.notEqual(
            refreshedButton.intent.evidenceStatus[0].actualSha256,
            sha256,
        );
        assert.equal(refreshedButton.intent.stale, true);

        validateRegistry(refreshed, options);
        const malformed = structuredClone(initial);
        malformed.components[0].unexpected = true;
        assert.throws(
            () => validateRegistry(malformed, options),
            /Schema validation failed/,
        );
        const duplicate = structuredClone(initial);
        duplicate.components[1].id = duplicate.components[0].id;
        assert.throws(
            () => validateRegistry(duplicate, options),
            /Duplicate component id/,
        );
        assert.equal(
            (await readFile(registryPath, 'utf8')).includes(
                'Preserved fixture intent',
            ),
            true,
        );
    } finally {
        await rm(appRoot, { recursive: true, force: true });
    }
});

test('retains verified provenance only for an unchanged artifact baseline', {
    skip: !process.env.GOVKIT_CONSUMED_ROOT,
}, async () => {
    const appRoot = await makeFixture();
    const registryPath = path.join(appRoot, 'registry.json');
    const options = {
        ...optionsFor(appRoot, registryPath),
        consumedRoot: process.env.GOVKIT_CONSUMED_ROOT,
    };
    try {
        const baseline = buildRegistry({
            ...options,
            preserveCurated: false,
        });
        assert.equal(baseline.provenance.consumed.sourceEquivalence, 'unknown');
        const verified = structuredClone(baseline);
        verified.provenance.consumed.sourceEquivalence = 'verified';
        await writeFile(registryPath, JSON.stringify(verified));

        const retained = buildRegistry(options);
        assert.equal(
            retained.provenance.consumed.sourceEquivalence,
            'verified',
        );

        const dirtyPath = `.registry-provenance-regression-${process.pid}-${Date.now()}`;
        const dirtyFile = path.join(kitRoot, dirtyPath);
        try {
            await writeFile(dirtyFile, 'uncommitted build input');
            const changedKit = structuredClone(verified);
            changedKit.provenance.kit.dirty = [dirtyPath];
            await writeFile(registryPath, JSON.stringify(changedKit));
            const invalidatedKit = buildRegistry(options);
            assert.equal(
                invalidatedKit.provenance.consumed.sourceEquivalence,
                'unknown',
            );
        } finally {
            await rm(dirtyFile, { force: true });
        }

        const changedDist = structuredClone(verified);
        changedDist.provenance.consumed.dist['dist/index.es.js'] = '0'.repeat(
            64,
        );
        await writeFile(registryPath, JSON.stringify(changedDist));
        const invalidatedDist = buildRegistry(options);
        assert.equal(
            invalidatedDist.provenance.consumed.sourceEquivalence,
            'unknown',
        );
    } finally {
        await rm(appRoot, { recursive: true, force: true });
    }
});
