import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { type IInputFileAvatarValue, InputFileAvatar } from '@aragon/gov-ui-kit';
import { useWatch } from 'react-hook-form';
import type { IAvatarInputProps } from './avatarInput.api';

export type AvatarInputBaseForm = Record<string, IInputFileAvatarValue | undefined>;

const defaultMaxFileSize = 1 * 1024 * 1024; // 1 MB in bytes
const defaultMaxDimension = 1024;

export const AvatarInput: React.FC<IAvatarInputProps> = (props) => {
    const {
        name,
        helpText,
        fieldPrefix,
        maxFileSize = defaultMaxFileSize,
        maxDimension = defaultMaxDimension,
        isOptional = true,
    } = props;

    const { t } = useTranslations();

    const fieldName = fieldPrefix ? `${fieldPrefix}.${name}` : name;

    const { value, ...avatarField } = useFormField<AvatarInputBaseForm, typeof fieldName>(fieldName, {
        label: t('app.shared.avatarInput.label'),
        rules: {
            validate: (value) => (value?.error ? `app.shared.avatarInput.error.${value.error}` : undefined),
        },
    });

    // Watch the avatar field to properly update the InputFileAvatar component when its value changes
    const avatarValue = useWatch<AvatarInputBaseForm>({
        name: fieldName,
        defaultValue: undefined,
    });

    const defaultHelpText = t('app.shared.avatarInput.helpText');

    return (
        <InputFileAvatar
            value={avatarValue}
            helpText={helpText ?? defaultHelpText}
            maxDimension={maxDimension}
            maxFileSize={maxFileSize}
            isOptional={isOptional}
            {...avatarField}
        />
    );
};
