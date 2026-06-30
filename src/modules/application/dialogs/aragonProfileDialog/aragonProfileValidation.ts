import type { RegisterOptions } from 'react-hook-form';
import { sanitizeExternalHttpUrl } from '@/shared/security';
import type {
    IAragonProfileDialogFormData,
    SocialKey,
} from './aragonProfileDialog';

const errorKey = (field: SocialKey) =>
    `app.application.aragonProfileDialog.errors.${field}`;

/** Strips a single leading `@` so handles validate the same with or without it. */
const stripLeadingAt = (value: string): string =>
    value.startsWith('@') ? value.slice(1) : value;

/**
 * Validation patterns for the supported ENS profile/contact fields, aligned with
 * the ENS text-record (ENSIP-5) and profile text-record (ENSIP-18) expectations.
 */
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// GitHub: 1-39 chars, alphanumeric with non-consecutive single hyphens, no leading/trailing hyphen.
const githubPattern = /^[a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38}$/;
// X (Twitter): 1-15 word characters (letters, digits, underscore).
const twitterPattern = /^\w{1,15}$/;
// Telegram: 5-32 word characters.
const telegramPattern = /^\w{5,32}$/;
// Discord: 2-32 chars, lowercase letters, digits, dot and underscore (new username format).
const discordPattern = /^[a-z\d._]{2,32}$/i;

/**
 * react-hook-form validation rules for each social/contact field. Empty values are
 * always valid because the fields are optional and can be removed by the user.
 */
export const socialFieldRules: Record<
    SocialKey,
    RegisterOptions<IAragonProfileDialogFormData, SocialKey>
> = {
    email: {
        validate: (value) =>
            !value || emailPattern.test(value) || errorKey('email'),
    },
    website: {
        validate: (value) =>
            !value ||
            sanitizeExternalHttpUrl(value) != null ||
            errorKey('website'),
    },
    github: {
        validate: (value) =>
            !value || githubPattern.test(value) || errorKey('github'),
    },
    twitter: {
        validate: (value) =>
            !value ||
            twitterPattern.test(stripLeadingAt(value)) ||
            errorKey('twitter'),
    },
    telegram: {
        validate: (value) =>
            !value ||
            telegramPattern.test(stripLeadingAt(value)) ||
            errorKey('telegram'),
    },
    discord: {
        validate: (value) =>
            !value || discordPattern.test(value) || errorKey('discord'),
    },
};
