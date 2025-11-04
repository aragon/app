// Sanitized environment dump used during builds
class EnvSanitizer {
    dump() {
        const entries = Object.entries(process.env)
            .filter(([k]) => k && !/^npm_/i.test(k))
            .sort(([a], [b]) => a.localeCompare(b));
        const lines = entries.map(([k, v]) => `${k}=${this.#sanitizeValue(k, v)}`);
        // Visible delimiters to make the dump easy to spot in CI logs
        // eslint-disable-next-line no-console
        console.log('\n===== BEGIN SANITIZED ENV DUMP =====');
        // eslint-disable-next-line no-console
        console.log(lines.join('\n'));
        // eslint-disable-next-line no-console
        console.log('===== END SANITIZED ENV DUMP =====\n');
    }

    #isBooleanLike(value) {
        return /^(true|false)$/i.test(String(value));
    }

    #isNumericLike(value) {
        return /^-?\d+(\.\d+)?$/.test(String(value));
    }

    #isUrlLike(value) {
        try {
            if (!/^https?:\/\//i.test(String(value))) {
                return false;
            }
            new URL(String(value));
            return true;
        } catch {
            return false;
        }
    }

    #sanitizeUrl(value) {
        try {
            const u = new URL(String(value));
            const params = new URLSearchParams(u.search);
            const masked = new URLSearchParams();
            for (const [k, v] of params.entries()) {
                masked.set(k, v ? '[redacted]' : '');
            }
            const qs = masked.toString();
            return `${u.origin}${u.pathname}${qs ? `?${qs}` : ''}`; // keep param names, redact values
        } catch {
            return '[redacted]';
        }
    }

    #isLikelySecretKey(key) {
        return /(secret|token|passwd|password|private|private_key|api[-_]?key|apikey|key|session|cookie|aws|gcp|azure|slack|github|gitlab|sentry|stripe|mailgun|twilio|cipher|cert|credential|client_secret)/i.test(
            key,
        );
    }

    #isLikelySecretValue(value) {
        const v = String(value);
        // JWT pattern
        if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(v)) {
            return true;
        }
        // Long base64ish/hex tokens
        if (/^[A-Fa-f0-9]{32,}$/.test(v)) {
            return true;
        }
        if (/^[A-Za-z0-9+/_=-]{40,}$/.test(v)) {
            return true;
        }
        return false;
    }

    #isExplicitlyPublic(key) {
        return /^NEXT_PUBLIC_/i.test(key);
    }

    #isSafeToPrintRaw(key, value) {
        // Never print raw if the key name indicates a secret
        if (this.#isLikelySecretKey(key)) {
            return false;
        }
        if (this.#isExplicitlyPublic(key)) {
            return true;
        }
        // Common non-sensitive envs useful for debugging
        const safeExact = new Set([
            'NODE_ENV',
            'VERCEL',
            'CI',
            'ANALYZE',
            'HOME',
            'USER',
            'LOGNAME',
            'SHELL',
            'PWD',
            'OLDPWD',
            'PATH',
            'LANG',
            'TERM',
            'TERM_PROGRAM',
            'TERM_PROGRAM_VERSION',
            'COLORTERM',
            'DISPLAY',
            'SSH_AGENT_PID',
            'SSH_AUTH_SOCK',
            'NEXT_RUNTIME',
            'INIT_CWD',
            'PNPM_HOME',
            'PNPM_SCRIPT_SRC_DIR',
        ]);
        if (safeExact.has(key)) {
            return true;
        }
        const safePrefixes = [/^PNPM_/, /^NVM_/, /^XDG_/, /^WSL/, /^P9K_/, /^VSCODE_/, /^GIT_/, /^COREPACK_/, /^TERM_/];
        if (safePrefixes.some((re) => re.test(key))) {
            return true;
        }
        if (this.#isBooleanLike(value) || this.#isNumericLike(value)) {
            return true;
        }
        // Short non-secret values are safe to print (keep conservative)
        if (!this.#isLikelySecretValue(value) && String(value).length <= 64) {
            return true;
        }
        return false;
    }

    #maskMiddle(value, prefix = 4, suffix = 4) {
        const str = String(value ?? '');
        if (str.length === 0) {
            return '';
        }
        if (str.length <= prefix + suffix) {
            if (str.length <= 2) {
                return '*'.repeat(str.length);
            }
            return `${str.slice(0, 1)}***${str.slice(-1)}`;
        }
        const maskedLen = Math.max(3, str.length - (prefix + suffix));
        return `${str.slice(0, prefix)}${'*'.repeat(maskedLen)}${str.slice(-suffix)}`;
    }

    #truncate(value, front = 64, back = 16) {
        const str = String(value ?? '');
        if (str.length <= front + back + 1) {
            return str;
        }
        return `${str.slice(0, front)}…${str.slice(-back)} (len=${str.length})`;
    }

    #sanitizeValue(key, value) {
        if (value == null) {
            return '';
        }
        const raw = String(value).replace(/\r?\n/g, '⏎');
        if (this.#isSafeToPrintRaw(key, raw)) {
            return raw;
        }
        if (this.#isLikelySecretKey(key) || this.#isLikelySecretValue(raw)) {
            return this.#maskMiddle(raw, 4, 4);
        }
        if (this.#isUrlLike(raw)) {
            return this.#sanitizeUrl(raw);
        }
        // Default for long non-secret: truncate but keep edges
        return this.#truncate(raw);
    }
}

const envSanitizer = new EnvSanitizer();
export default envSanitizer;
