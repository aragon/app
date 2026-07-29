import type {
    ClientOptions,
    ErrorEvent,
    Event,
    EventHint,
    ScopeContext,
} from '@sentry/core';
import {
    captureException,
    captureMessage,
    captureRequestError,
    setUser,
    withServerActionInstrumentation,
} from '@sentry/nextjs';

export interface ILogErrorParams {
    /**
     * Additional data to be logged.
     */
    context?: Record<string, unknown>;
}

export interface ILogMessageParams {
    /**
     * Additional data to be logged.
     */
    context?: ScopeContext['tags'];
    /**
     * Severity level of the message.
     * @default info
     */
    level?: ScopeContext['level'];
    /**
     * Optional noise classification, applied as the `noise_class` tag using the same
     * typed taxonomy `beforeSend` uses — so explicit (call-site) and pattern-based
     * (`beforeSend`) tagging share one source of truth and never drift from the saved
     * views / alert filters.
     */
    noiseClass?: SentryNoiseClass;
}

/**
 * Classification of an event that we keep in Sentry but route out of the default
 * alert stream by tagging it. Used as the value of the `noise_class` tag.
 * - `expected`: normal user/wallet behaviour — kept so a complaint can still be
 *   investigated (search `user.id:0x... noise_class:expected`), just not alerted on.
 * - `infra`: backend/RPC/proxy failures — routed to devops/backend.
 * - `security-probe`: scanner/injection traffic — kept for security review.
 * - `internal-broken-link`: a broken link inside our own app (e.g. a bad network
 *   slug reached from an `aragon.org` referer) — worth triaging/fixing.
 */
export type SentryNoiseClass =
    | 'expected'
    | 'infra'
    | 'security-probe'
    | 'internal-broken-link';

class MonitoringUtils {
    /**
     * Expected, non-actionable errors that represent normal user/wallet behaviour
     * (rejections, missing connection, expected RPC param errors). We do NOT hide these:
     * `beforeSend` tags them `noise_class=expected` and keeps them in Sentry so a future
     * complaint can be investigated (search `user.id:0x...`), but they stay out of the
     * default alert stream / bug board.
     */
    expectedErrorPatterns = [
        'User rejected the request', // Standard wallet rejection (MetaMask, WalletConnect, …)
        'Signing aborted by user', // Opera wallet rejection
        'User denied transaction signature', // Older wallet variants
        'must be connected', // Dialog invariants opened without a connected wallet
        'wallet must has at least one account', // Wallet connected with no selected account
        'exceeds the balance', // Insufficient balance for gas/value
        "session topic doesn't exist", // WalletConnect: stale session
        'No matching key. session topic', // WalletConnect: stale session
    ];

    /**
     * EIP-1193 provider error codes that represent normal user behaviour rather than bugs.
     * These often surface as unhandled rejections of plain `{ code, message }` objects
     * (so the message-based `ignoreErrors` cannot catch them) — `beforeSend` matches the
     * serialized payload instead.
     */
    private expectedProviderErrorCodes = [4001, 4100, 4900, 4901];

    /**
     * Non-actionable failures from infrastructure outside our control that belongs to the
     * user, not our backend: mainly ENS off-chain (CCIP) gateways returning malformed
     * data when resolving a user's ENS avatar/name. We can't fix someone else's gateway and
     * it only degrades an avatar, so — like expected user behaviour — these are kept at
     * `info` level (searchable for investigation) but never alerted on.
     */
    private nonActionableExternalPatterns = [
        'resolveWithGateways', // ENS forward resolution via off-chain gateway
        'reverseWithGateways', // ENS reverse resolution via off-chain gateway
        'OffchainLookupError', // viem CCIP-read lookup failure
    ];

    /**
     * Objectively zero-signal noise injected by the user's environment, not our code:
     * browser extensions and e-mail link crawlers. Safe to drop at the source.
     */
    private dropPatterns = [
        '__firefox__', // Firefox extension internals
        'window.ethereum.selectedAddress', // Wallet extension probing
        'Object Not Found Matching Id', // Outlook SafeLink crawler artifact
        // In-app-browser/WebView scripts JSON.stringify-ing a DOM node (React fiber).
        // Deliberately narrow: a genuine cyclic-serialization bug in OUR data does NOT
        // contain `__reactFiber`, so it is never dropped and will still surface.
        '__reactFiber',
    ];

    /**
     * Backend/RPC/proxy failures. Real signal, but the source is outside our codebase —
     * tagged `infra` so devops/backend can pick them up, kept visible (never dropped).
     */
    private infraPatterns = [
        "Unexpected token '<'", // Backend/proxy returned HTML instead of JSON
        '<html>',
        'Error parsing response',
        'RPC endpoint returned error status',
        'HTTP request failed',
        'fetch failed',
    ];

    getBaseConfig = (): Pick<
        ClientOptions,
        | 'enabled'
        | 'dsn'
        | 'tracesSampleRate'
        | 'environment'
        | 'release'
        | 'beforeSend'
    > => ({
        enabled: this.isEnabled(),
        dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
        tracesSampleRate: 0.1,
        environment: process.env.NEXT_PUBLIC_ENV,
        release: process.env.version,
        beforeSend: this.beforeSend,
    });

    /**
     * Routes events instead of hiding them. Only objectively zero-value third-party junk
     * (extensions, crawlers, WebView scripts serializing DOM nodes) is dropped. Everything
     * that could ever aid an investigation is KEPT and, when noisy, tagged via `noise_class`
     * so it can be filtered out of the default alert stream but still searched later:
     * - expected user/wallet behaviour → `expected`
     * - backend/RPC failures → `infra`
     * - scanner/injection traffic → `security-probe`
     */
    beforeSend = (event: ErrorEvent, hint?: EventHint): ErrorEvent | null => {
        const message = this.getEventMessage(event, hint);

        // Drop only zero-signal third-party junk (never our users' or our own errors).
        if (this.dropPatterns.some((pattern) => message.includes(pattern))) {
            return null;
        }

        const noiseClass = this.classifyNoise(event, message, hint);
        if (noiseClass != null) {
            event.tags = { ...event.tags, noise_class: noiseClass };
            // Expected/non-actionable events are kept for investigation but demoted to
            // `info` so they read as non-bugs and stay out of error-level alerts.
            if (noiseClass === 'expected') {
                event.level = 'info';
            }
        }

        return event;
    };

    logError = (error: unknown, params?: ILogErrorParams) => {
        const { context } = params ?? {};
        captureException(error, { extra: context });
    };

    /**
     * Attaches (or clears) the current user so events become searchable by `user.id`.
     * Pass the connected wallet address, or null on disconnect.
     */
    identifyUser = (id: string | null) => {
        setUser(id == null ? null : { id });
    };

    logMessage = (name: string, params?: ILogMessageParams) => {
        const { context, level = 'info', noiseClass } = params ?? {};
        const tags =
            noiseClass != null
                ? { ...context, noise_class: noiseClass }
                : context;
        captureMessage(name, { level, tags });
    };

    logRequestError = captureRequestError;

    serverActionWrapper = withServerActionInstrumentation;

    private classifyNoise = (
        event: Event,
        message: string,
        hint?: EventHint,
    ): SentryNoiseClass | undefined => {
        // Expected user/wallet behaviour and non-actionable external (ENS gateway)
        // failures: kept for investigation, demoted to info, out of alerts.
        if (
            this.expectedErrorPatterns.some((pattern) =>
                message.includes(pattern),
            ) ||
            this.nonActionableExternalPatterns.some((pattern) =>
                message.includes(pattern),
            ) ||
            this.hasExpectedProviderErrorCode(hint, event)
        ) {
            return 'expected';
        }

        if (this.infraPatterns.some((pattern) => message.includes(pattern))) {
            return 'infra';
        }

        if (this.isProbeUrl(event.request?.url)) {
            return 'security-probe';
        }

        return undefined;
    };

    /**
     * Detects scanner/probe traffic. Legitimate routes only ever contain a network slug,
     * an address/ENS and path segments, so any of the following marks an attack/scan:
     * double-encoding, a URL that fails to decode, or template/injection metacharacters
     * (e.g. the SSTI probe `…/dfb__${98991*97996}__::.x/…`).
     */
    private isProbeUrl = (url?: string) => {
        if (url == null) {
            return false;
        }

        if (url.includes('%25')) {
            // Double-encoded characters — almost always a scanner, not a real navigation.
            return true;
        }

        let decoded: string;
        try {
            decoded = decodeURIComponent(url);
        } catch {
            return true;
        }

        // Metacharacters that never appear in a valid network/address/ENS/slug path.
        return /[<>${}`;()|]|\]\]|\*\*/.test(decoded);
    };

    private getEventMessage = (event: Event, hint?: EventHint): string => {
        const fromException =
            hint?.originalException instanceof Error
                ? hint.originalException.message
                : '';
        const fromEvent =
            event.exception?.values
                ?.map((value) => value.value ?? '')
                .join(' ') ?? '';
        // Unhandled rejections of plain objects carry their real text in `.message`.
        // We match only that field — never a JSON dump of the whole object — so a broad
        // phrase (e.g. `must be connected`) can't accidentally match unrelated nested
        // data and mis-route a genuine bug into the `expected`/`infra` noise classes.
        const fromSerializedMessage = this.getSerializedMessage(
            hint?.originalException ?? event.extra?.__serialized__,
        );

        return [
            fromException,
            fromEvent,
            event.message ?? '',
            fromSerializedMessage,
        ].join(' ');
    };

    /**
     * True when the captured payload is an EIP-1193 provider error with an expected
     * (user-driven) code — e.g. an unhandled rejection of `{ code: 4001, message }`.
     */
    private hasExpectedProviderErrorCode = (
        hint: EventHint | undefined,
        event: Event,
    ): boolean => {
        const candidate = (hint?.originalException ??
            event.extra?.__serialized__) as { code?: unknown } | undefined;
        const code = candidate?.code;

        return (
            typeof code === 'number' &&
            this.expectedProviderErrorCodes.includes(code)
        );
    };

    private getSerializedMessage = (value: unknown): string => {
        if (value == null || typeof value !== 'object') {
            return '';
        }
        const message = (value as { message?: unknown }).message;
        return typeof message === 'string' ? message : '';
    };

    // Only enable error tracking for development, staging and production environments
    private isEnabled = () =>
        ['development', 'staging', 'production'].includes(
            process.env.NEXT_PUBLIC_ENV!,
        );
}

export const monitoringUtils = new MonitoringUtils();
