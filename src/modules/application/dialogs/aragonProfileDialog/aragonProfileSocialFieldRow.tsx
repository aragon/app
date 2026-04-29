import { Button, IconType, InputText } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type {
    IAragonProfileDialogFormData,
    SocialKey,
} from './aragonProfileDialog';

export interface IAragonProfileSocialFieldRowProps {
    /** Form field name. */
    fieldName: SocialKey;
    /** Callback when the remove button is clicked. */
    onRemove: () => void;
}

const socialKeyToIconType: Record<SocialKey, IconType> = {
    github: IconType.SOCIAL_GITHUB,
    twitter: IconType.SOCIAL_X,
    website: IconType.SOCIAL_WEBSITE,
    email: IconType.SOCIAL_EMAIL,
    discord: IconType.SOCIAL_DISCORD,
    telegram: IconType.SOCIAL_TELEGRAM,
};

/** Renders a single social input row with a remove button. */
export const AragonProfileSocialFieldRow: React.FC<
    IAragonProfileSocialFieldRowProps
> = (props) => {
    const { fieldName, onRemove } = props;

    const { t } = useTranslations();

    const socialField = useFormField<IAragonProfileDialogFormData, SocialKey>(
        fieldName,
        { trimOnBlur: true },
    );

    return (
        <div className="flex items-center gap-2">
            <InputText
                className="flex-1"
                iconLeft={socialKeyToIconType[fieldName]}
                id={`aragon-profile-social-${fieldName}`}
                placeholder={t(
                    `app.application.aragonProfileDialog.fields.socials.${fieldName}`,
                )}
                {...socialField}
            />
            <Button
                iconLeft={IconType.CLOSE}
                onClick={onRemove}
                size="md"
                type="button"
                variant="tertiary"
            />
        </div>
    );
};
