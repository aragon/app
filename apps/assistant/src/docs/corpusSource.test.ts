import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildGitEnv, readGitHead, syncCorpus } from './corpusSource';

// A throwaway repository stands in for aragon/platform-doc; `file://` is the local transport
// that supports the shallow fetch the sync relies on.
const git = (dir: string, ...args: string[]): string =>
    execFileSync(
        'git',
        [
            '-C',
            dir,
            '-c',
            'user.name=test',
            '-c',
            'user.email=test@example.com',
            '-c',
            'commit.gpgsign=false',
            ...args,
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    ).trim();

describe('corpusSource', () => {
    let workDir: string;
    let originDir: string;
    let originUrl: string;
    let targetDir: string;

    beforeEach(async () => {
        workDir = await mkdtemp(path.join(os.tmpdir(), 'corpus-source-'));
        originDir = path.join(workDir, 'origin');
        originUrl = `file://${originDir}`;
        targetDir = path.join(workDir, 'checkout');
        execFileSync('git', ['init', '-q', '-b', 'development', originDir]);
        await writeFile(path.join(originDir, 'page.md'), '# Page\n');
        git(originDir, 'add', '.');
        git(originDir, 'commit', '-q', '-m', 'first');
    });

    afterEach(async () => {
        await rm(workDir, { recursive: true, force: true });
    });

    describe('syncCorpus', () => {
        it('fetches the branch head into a new directory and reports its commit', async () => {
            const result = syncCorpus({
                repoUrl: originUrl,
                ref: 'development',
                targetDir,
            });

            expect(result).toEqual({
                rootDir: targetDir,
                commit: git(originDir, 'rev-parse', 'HEAD'),
            });
            expect(
                await readFile(path.join(targetDir, 'page.md'), 'utf8'),
            ).toBe('# Page\n');
            expect(readGitHead(targetDir)).toBe(result.commit);
            // Fetched by URL: the checkout keeps no remote.
            expect(git(targetDir, 'remote')).toBe('');
        });

        it('moves an earlier checkout to the new head, dropping what upstream removed', async () => {
            syncCorpus({ repoUrl: originUrl, ref: 'development', targetDir });
            await writeFile(path.join(originDir, 'new.md'), '# New\n');
            git(originDir, 'rm', '-q', 'page.md');
            git(originDir, 'add', '.');
            git(originDir, 'commit', '-q', '-m', 'second');

            const result = syncCorpus({
                repoUrl: originUrl,
                ref: 'development',
                targetDir,
            });

            expect(result.commit).toBe(git(originDir, 'rev-parse', 'HEAD'));
            expect(existsSync(path.join(targetDir, 'new.md'))).toBe(true);
            expect(existsSync(path.join(targetDir, 'page.md'))).toBe(false);
        });

        it('leaves the checkout as it was when the repository cannot be reached', () => {
            const before = syncCorpus({
                repoUrl: originUrl,
                ref: 'development',
                targetDir,
            });

            expect(() =>
                syncCorpus({
                    repoUrl: `file://${path.join(workDir, 'missing')}`,
                    ref: 'development',
                    targetDir,
                }),
            ).toThrow(/^git fetch failed: /);
            expect(readGitHead(targetDir)).toBe(before.commit);
            expect(existsSync(path.join(targetDir, 'page.md'))).toBe(true);
        });
    });

    describe('readGitHead', () => {
        it('is undefined for a directory that is not a repository, even one inside a repository', async () => {
            const plainDir = path.join(originDir, 'plain');
            await mkdir(plainDir);

            expect(readGitHead(plainDir)).toBeUndefined();
            expect(readGitHead(path.join(workDir, 'missing'))).toBeUndefined();
        });
    });

    describe('buildGitEnv', () => {
        it('passes the token as a basic authorization header for the repository host, nowhere else, and switches the credential helpers off', () => {
            const env = buildGitEnv({
                repoUrl: 'https://github.com/aragon/platform-doc.git',
                token: 'ghp_secret',
            });
            const [scheme, credentials] = (env.GIT_CONFIG_VALUE_0 ?? '')
                .replace('AUTHORIZATION: ', '')
                .split(' ');

            expect(env.GIT_TERMINAL_PROMPT).toBe('0');
            expect(env.GIT_CONFIG_COUNT).toBe('2');
            expect(env.GIT_CONFIG_KEY_0).toBe(
                'http.https://github.com/.extraheader',
            );
            expect(env.GIT_CONFIG_KEY_1).toBe('credential.helper');
            expect(env.GIT_CONFIG_VALUE_1).toBe('');
            expect(scheme).toBe('basic');
            expect(Buffer.from(credentials ?? '', 'base64').toString()).toBe(
                'x-access-token:ghp_secret',
            );
            expect(
                Object.values(env).some((value) =>
                    value?.includes('ghp_secret'),
                ),
            ).toBe(false);
        });

        it('only disables prompts when there is no token', () => {
            const env = buildGitEnv({
                repoUrl: 'https://github.com/aragon/platform-doc.git',
            });

            expect(env.GIT_TERMINAL_PROMPT).toBe('0');
            expect(env.GIT_CONFIG_COUNT).toBeUndefined();
        });
    });
});
