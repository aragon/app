import classNames from 'classnames';
import { useCallback, useState } from 'react';
import { ErrorCode, type FileRejection, useDropzone } from 'react-dropzone';
import { useRandomId } from '../../../hooks';
import { Avatar } from '../../avatars';
import { Icon, IconType } from '../../icon';
import { Spinner } from '../../spinner';
import { InputContainer, type InputVariant } from '../inputContainer';
import { type IInputFileAvatarProps, InputFileAvatarError } from './inputFileAvatar.api';

const stateToClassNames: Record<InputVariant | 'disabled', { containerClasses: string[]; addIconClasses: string[] }> = {
    default: {
        containerClasses: [
            'border-[1px] border-surface-default hover:border-surface-hover border-dashed cursor-pointer focus-ring ring-accent-focus',
        ],
        addIconClasses: ['icon-surface-default-control group-hover:icon-surface-hover-control'],
    },
    warning: {
        containerClasses: [
            'border-[1px] border-warning-default hover:border-warning-hover-file-avatar border-dashed cursor-pointer focus-ring ring-warning-focus',
        ],
        addIconClasses: ['icon-warning-default group-hover:icon-warning-hover'],
    },
    critical: {
        containerClasses: [
            'border-[1px] border-critical-default-input hover:border-critical-hover-input border-dashed cursor-pointer focus-ring ring-critical-focus',
        ],
        addIconClasses: ['icon-critical-default group-hover:icon-critical-hover'],
    },
    disabled: {
        containerClasses: ['border-[1px] border-surface-disabled'],
        addIconClasses: ['icon-surface-disabled-control'],
    },
};

const dropzoneErrorToError: Record<string, InputFileAvatarError | undefined> = {
    [ErrorCode.FileInvalidType]: InputFileAvatarError.FILE_INVALID_TYPE,
    [ErrorCode.FileTooLarge]: InputFileAvatarError.FILE_TOO_LARGE,
    [ErrorCode.TooManyFiles]: InputFileAvatarError.TOO_MANY_FILES,
};

export const InputFileAvatar: React.FC<IInputFileAvatarProps> = (props) => {
    const {
        maxFileSize,
        minDimension,
        maxDimension,
        acceptedFileTypes = { 'image/png': [], 'image/gif': [], 'image/jpeg': ['.jpg', '.jpeg'] },
        onlySquare,
        variant = 'default',
        disabled,
        value,
        onChange,
        ...otherProps
    } = props;

    const { id, ...containerProps } = otherProps;
    const randomId = useRandomId(id);

    const [isLoading, setIsLoading] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            if (rejectedFiles.length > 0) {
                const dropzoneError = rejectedFiles[0].errors[0].code;
                const internalError = dropzoneErrorToError[dropzoneError] ?? InputFileAvatarError.UNKNOWN_ERROR;
                onChange({ error: internalError });

                return;
            }

            const file = acceptedFiles[0];
            const image = new Image();
            setIsLoading(true);

            const onImageLoad = () => {
                const isBelowMinDimension = minDimension && (image.width < minDimension || image.height < minDimension);
                const isAboveMaxDimension = maxDimension && (image.width > maxDimension || image.height > maxDimension);

                if (onlySquare && image.height !== image.width) {
                    onChange({ error: InputFileAvatarError.SQUARE_ONLY });
                } else if (isBelowMinDimension ?? isAboveMaxDimension) {
                    onChange({ error: InputFileAvatarError.WRONG_DIMENSION });
                } else {
                    onChange({ url: image.src, file });
                }

                setIsLoading(false);
            };

            image.addEventListener('load', onImageLoad);
            image.addEventListener('error', () => {
                setIsLoading(false);
                onChange({ error: InputFileAvatarError.UNKNOWN_ERROR });
            });

            image.src = URL.createObjectURL(file);
        },
        [maxDimension, minDimension, onChange, onlySquare],
    );

    const { getRootProps, getInputProps } = useDropzone({
        accept: acceptedFileTypes,
        maxSize: maxFileSize,
        disabled,
        onDrop,
        multiple: false,
    });

    const handleCancel = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onChange(undefined);
        if (value?.url) {
            URL.revokeObjectURL(value.url);
        }
    };

    const processedVariant = disabled ? 'disabled' : variant;
    const { containerClasses, addIconClasses } = stateToClassNames[processedVariant];

    const inputAvatarClassNames = classNames(
        'group flex size-16 items-center justify-center rounded-full bg-surface-default hover:shadow-surface-default',
        containerClasses,
    );

    return (
        <InputContainer id={randomId} useCustomWrapper={true} {...containerProps}>
            <div {...getRootProps()} className={inputAvatarClassNames}>
                <input {...getInputProps()} id={randomId} />

                {value?.url || value?.error ? (
                    <div className="relative">
                        <Avatar className="cursor-pointer" data-testid="avatar" size="lg" src={value.url} />
                        <button
                            aria-label="Cancel Selection"
                            className={classNames(
                                'absolute -top-1 -right-1 cursor-pointer rounded-full bg-surface-default p-1 shadow-surface-default ring-accent-focus focus-ring',
                            )}
                            onClick={handleCancel}
                            type="button"
                        >
                            <Icon icon={IconType.CLOSE} size="sm" />
                        </button>
                    </div>
                ) : (
                    <>
                        {isLoading && <Spinner size="lg" variant="neutral" />}
                        {!value?.url && !isLoading && (
                            <Icon className={classNames(addIconClasses)} icon={IconType.PLUS} size="lg" />
                        )}
                    </>
                )}
            </div>
        </InputContainer>
    );
};
