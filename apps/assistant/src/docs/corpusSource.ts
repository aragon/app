import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

// The knowledge base is a private repository the index build fetches on demand — it is not
// vendored into this one. One shallow fetch by URL: nothing about the remote is written to the
// checkout's configuration, and syncing an existing checkout just moves it to the current head.

export const docsRepository = {
    name: 'aragon/platform-doc',
    url: 'https://github.com/aragon/platform-doc.git',
    ref: 'development',
} as const;

// Generous for a shallow fetch of a few megabytes; a hung network call still fails the build.
const gitTimeoutMs = 120_000;

export interface IGitEnvParams {
    repoUrl: string;
    /**
     * Token with read access to the repository. Without one git relies on the credential helper
     * of the machine, which is what a developer checkout does.
     */
    token?: string;
}

export interface ISyncCorpusParams extends IGitEnvParams {
    ref: string;
    targetDir: string;
}

export interface ICorpusSource {
    rootDir: string;
    commit: string;
}

const baseGitEnv = (): NodeJS.ProcessEnv => ({
    ...process.env,
    GIT_TERMINAL_PROMPT: '0',
});

/**
 * Environment for the git calls: never a terminal prompt, and the token — when there is one — as
 * the `Authorization` header git sends to the repository host (the way actions/checkout passes
 * its token), so it appears in no argument list, no URL of an error message and no file on disk.
 * The token is then the only credential: the machine's credential helpers are switched off, or
 * git would fall back to them after a rejected token and erase the stored credential as bad.
 */
export const buildGitEnv = (params: IGitEnvParams): NodeJS.ProcessEnv => {
    const { repoUrl, token } = params;
    const env = baseGitEnv();

    if (token == null || token === '') {
        return env;
    }

    const credentials = Buffer.from(`x-access-token:${token}`).toString(
        'base64',
    );

    return {
        ...env,
        GIT_CONFIG_COUNT: '2',
        GIT_CONFIG_KEY_0: `http.${new URL(repoUrl).origin}/.extraheader`,
        GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${credentials}`,
        GIT_CONFIG_KEY_1: 'credential.helper',
        GIT_CONFIG_VALUE_1: '',
    };
};

// Runs one git command; a failure surfaces as an Error naming the git verb and the first line
// git wrote to stderr.
const runGit = (args: string[], env: NodeJS.ProcessEnv): string => {
    try {
        return execFileSync('git', args, {
            env,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
            timeout: gitTimeoutMs,
        }).trim();
    } catch (error) {
        const verb = args[0] === '-C' ? args[2] : args[0];
        const stderr = (error as { stderr?: string }).stderr ?? '';
        const reason =
            stderr.split('\n').find((line) => line.trim() !== '') ??
            (error instanceof Error ? error.message : String(error));

        throw new Error(`git ${verb ?? ''} failed: ${reason.trim()}`, {
            cause: error,
        });
    }
};

/**
 * Brings `targetDir` to the head of `ref` in the repository: a fresh directory and an earlier
 * checkout go through the same three commands (reinitializing a repository is a no-op). A
 * failure leaves the directory as it was.
 */
export const syncCorpus = (params: ISyncCorpusParams): ICorpusSource => {
    const { repoUrl, ref, targetDir, token } = params;
    const env = buildGitEnv({ repoUrl, token });

    mkdirSync(targetDir, { recursive: true });
    runGit(['init', '-q', targetDir], env);
    runGit(
        [
            '-C',
            targetDir,
            'fetch',
            '-q',
            '--depth=1',
            '--no-tags',
            '--recurse-submodules=no',
            repoUrl,
            ref,
        ],
        env,
    );
    runGit(
        [
            '-C',
            targetDir,
            'reset',
            '-q',
            '--hard',
            '--no-recurse-submodules',
            'FETCH_HEAD',
        ],
        env,
    );

    return {
        rootDir: targetDir,
        commit: runGit(['-C', targetDir, 'rev-parse', 'HEAD'], env),
    };
};

/**
 * Head commit of the repository rooted at `dir`, or undefined when the directory is not one or
 * has no commit yet. Only the directory itself counts: git would otherwise walk up to an
 * enclosing repository and report its head.
 */
export const readGitHead = (dir: string): string | undefined => {
    if (!existsSync(path.join(dir, '.git'))) {
        return undefined;
    }

    try {
        return runGit(
            ['-C', dir, 'rev-parse', '--verify', '-q', 'HEAD'],
            baseGitEnv(),
        );
    } catch {
        return undefined;
    }
};
