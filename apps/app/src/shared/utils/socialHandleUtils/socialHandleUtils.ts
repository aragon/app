/**
 * Format rules for social/contact handles, aligned with each service's own username
 * expectations. Domain-neutral on purpose: this is the single source of truth for any
 * place that validates or displays these handles (edit-profile form, member profile,
 * DAO profiles, …) so a value that fails validation is never turned into a dead link,
 * and vice versa.
 */
class SocialHandleUtils {
    // Email: local@domain.tld with no whitespace.
    private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // GitHub: 1-39 chars, alphanumeric with non-consecutive single hyphens, no leading/trailing hyphen.
    private readonly githubPattern =
        /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/;
    // X (Twitter): 1-15 word characters (letters, digits, underscore).
    private readonly twitterPattern = /^\w{1,15}$/;
    // Telegram: 5-32 word characters.
    private readonly telegramPattern = /^\w{5,32}$/;
    // Discord: 2-32 chars, lowercase letters, digits, dot and underscore (new username format).
    private readonly discordPattern = /^[a-z\d._]{2,32}$/i;

    /** Strips a single leading `@` so handles validate and display the same with or without it. */
    stripLeadingAt(value: string): string {
        return value.startsWith('@') ? value.slice(1) : value;
    }

    isEmail(value: string): boolean {
        return this.emailPattern.test(value);
    }

    isGithubHandle(value: string): boolean {
        return this.githubPattern.test(value);
    }

    /** Accepts an optional leading `@`. */
    isTwitterHandle(value: string): boolean {
        return this.twitterPattern.test(this.stripLeadingAt(value));
    }

    /** Accepts an optional leading `@`. */
    isTelegramHandle(value: string): boolean {
        return this.telegramPattern.test(this.stripLeadingAt(value));
    }

    isDiscordHandle(value: string): boolean {
        return this.discordPattern.test(value);
    }
}

export const socialHandleUtils = new SocialHandleUtils();
