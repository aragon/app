import type { RegisterOptions } from 'react-hook-form';
import { sanitizeExternalHttpUrl } from '@/shared/security';
import { socialHandleUtils } from '@/shared/utils/socialHandleUtils';
import type {
    IAragonProfileDialogFormData,
    SocialKey,
} from './aragonProfileDialog';

const errorKey = (field: SocialKey) =>
    `app.application.aragonProfileDialog.errors.${field}`;

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
            !value || socialHandleUtils.isEmail(value) || errorKey('email'),
    },
    website: {
        validate: (value) =>
            !value ||
            sanitizeExternalHttpUrl(value) != null ||
            errorKey('website'),
    },
    github: {
        validate: (value) =>
            !value ||
            socialHandleUtils.isGithubHandle(value) ||
            errorKey('github'),
    },
    twitter: {
        validate: (value) =>
            !value ||
            socialHandleUtils.isTwitterHandle(value) ||
            errorKey('twitter'),
    },
    telegram: {
        validate: (value) =>
            !value ||
            socialHandleUtils.isTelegramHandle(value) ||
            errorKey('telegram'),
    },
    discord: {
        validate: (value) =>
            !value ||
            socialHandleUtils.isDiscordHandle(value) ||
            errorKey('discord'),
    },
};
