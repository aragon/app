import { Button, IconType, InputText } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import type {
    IAragonProfileDialogFormData,
    SocialKey,
} from './aragonProfileDialog';

/** Props for {@link AragonProfileSocialFieldRow}. */
export interface IAragonProfileSocialFieldRowProps {
    /** Form field name. */
    fieldName: SocialKey;
    /** Callback when the remove button is clicked. */
    onRemove: () => void;
}

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
                addon={t(
                    `app.application.aragonProfileDialog.fields.socials.${fieldName}`,
                )}
                className="flex-1"
                id={`aragon-profile-social-${fieldName}`}
                placeholder={t(
                    `app.application.aragonProfileDialog.fields.socials.${fieldName}`,
                )}
                wrapperClassName="h-12"
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
