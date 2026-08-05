import { Icon, IconType, Spinner, Tooltip } from '@aragon/gov-ui-kit';
import {
    AttachmentPrimitive,
    ComposerPrimitive,
    MessagePrimitive,
    useAui,
    useAuiState,
} from '@assistant-ui/react';
import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { chatCopy } from '../../copy';
import { TooltipIconButton } from '../tooltipIconButton';

// Port of the assistant-ui registry attachment components (Radix variant): the composer and user
// message attachment tiles, the image preview dialog and the add-attachment button. shadcn
// tooltip/avatar are replaced by the gov-ui-kit Tooltip and a plain thumb, lucide icons by
// gov-ui-kit icons; classes are remapped to the Aragon theme tokens.

const useFileSrc = (file: File | undefined) => {
    const [src, setSrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (!file) {
            setSrc(undefined);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setSrc(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return src;
};

const useAttachmentSrc = () => {
    const file = useAuiState((state) =>
        state.attachment.type === 'image' ? state.attachment.file : undefined,
    );
    const src = useAuiState((state) =>
        state.attachment.type === 'image'
            ? state.attachment.content?.find((part) => part.type === 'image')
                  ?.image
            : undefined,
    );

    return useFileSrc(file) ?? src;
};

interface IAttachmentPreviewProps {
    /**
     * Source URL of the previewed image.
     */
    src: string;
}

const AttachmentPreview: React.FC<IAttachmentPreviewProps> = (props) => {
    const { src } = props;
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        // The preview is decorative: the tile already names the attachment for assistive tech.
        // biome-ignore lint/performance/noImgElement: the widget is host-agnostic, next/image is unavailable.
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: onLoad is a load hook, not an interaction.
        <img
            alt=""
            className={classNames(
                'block h-auto max-h-[80vh] w-auto max-w-full object-contain',
                !isLoaded && 'invisible',
            )}
            height={600}
            onLoad={() => setIsLoaded(true)}
            src={src}
            width={800}
        />
    );
};

const AttachmentPreviewDialog: React.FC<PropsWithChildren> = (props) => {
    const { children } = props;
    const src = useAttachmentSrc();

    if (!src) {
        return children;
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild={true}>{children}</Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-neutral-900/60" />
                <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-w-3xl -translate-x-1/2 -translate-y-1/2 p-2 outline-none">
                    <Dialog.Title className="sr-only">
                        {chatCopy.attachments.previewTitle}
                    </Dialog.Title>
                    <div className="relative mx-auto flex max-h-[80dvh] w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-0">
                        <AttachmentPreview src={src} />
                    </div>
                    <Dialog.Close asChild={true}>
                        <TooltipIconButton
                            className="absolute top-4 right-4 bg-neutral-0/80 text-neutral-800 hover:bg-neutral-0"
                            tooltip={chatCopy.attachments.closePreview}
                            variant="unstyled"
                        >
                            <Icon icon={IconType.CLOSE} size="sm" />
                        </TooltipIconButton>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

const AttachmentThumb: React.FC = () => {
    const src = useAttachmentSrc();

    if (src == null) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Icon
                    className="text-neutral-500"
                    icon={IconType.COPY}
                    size="lg"
                />
            </div>
        );
    }

    return (
        // The thumbnail is decorative: the tile itself carries the accessible name.
        // biome-ignore lint/performance/noImgElement: the widget is host-agnostic, next/image is unavailable.
        <img
            alt=""
            className="h-full w-full object-cover"
            height={56}
            src={src}
            width={56}
        />
    );
};

const typeLabels: Record<string, string> = chatCopy.attachments.typeLabel;

const AttachmentUI: React.FC = () => {
    const aui = useAui();
    const isComposer = aui.attachment.source !== 'message';

    const typeLabel = useAuiState(
        (state) => typeLabels[state.attachment.type] ?? state.attachment.type,
    );

    const uploadState = useAuiState((state) =>
        state.attachment.status.type === 'running'
            ? 'uploading'
            : state.attachment.status.type === 'incomplete' &&
                state.attachment.status.reason === 'error'
              ? 'error'
              : undefined,
    );
    const isUploading = uploadState === 'uploading';
    const isError = uploadState === 'error';

    const errorMessage = useAuiState((state) =>
        state.attachment.status.type === 'incomplete' &&
        state.attachment.status.reason === 'error'
            ? (state.attachment.status.message ??
              chatCopy.fileAlerts.uploadFailed)
            : undefined,
    );

    const tooltipContent = (
        <span>
            <AttachmentPrimitive.Name />
            {errorMessage && <p>{errorMessage}</p>}
        </span>
    );

    return (
        <AttachmentPrimitive.Root className="relative">
            <AttachmentPreviewDialog>
                <Tooltip content={tooltipContent} triggerAsChild={true}>
                    <button
                        aria-label={`${typeLabel} attachment${
                            isError
                                ? ', upload failed'
                                : isUploading
                                  ? ', uploading'
                                  : ''
                        }`}
                        className={classNames(
                            'relative size-14 cursor-pointer overflow-hidden rounded-xl border bg-neutral-50 transition-opacity hover:opacity-75',
                            isError
                                ? 'border-critical-400'
                                : 'border-neutral-100',
                        )}
                        type="button"
                    >
                        <AttachmentThumb />
                        {isUploading && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center justify-center bg-neutral-0/60"
                            >
                                <Spinner size="sm" variant="neutral" />
                            </div>
                        )}
                        {isError && (
                            <div
                                aria-hidden="true"
                                className="absolute inset-0 flex items-center justify-center bg-critical-100/60"
                            >
                                <Icon
                                    className="text-critical-600"
                                    icon={IconType.WARNING}
                                    size="md"
                                />
                            </div>
                        )}
                    </button>
                </Tooltip>
            </AttachmentPreviewDialog>
            {isComposer && <AttachmentRemove />}
        </AttachmentPrimitive.Root>
    );
};

const AttachmentRemove: React.FC = () => (
    <AttachmentPrimitive.Remove asChild={true}>
        <TooltipIconButton
            className="absolute end-1.5 top-1.5 size-3.5 bg-neutral-0 text-neutral-800 shadow-sm hover:bg-neutral-0 hover:text-critical-600"
            side="top"
            size="none"
            tooltip={chatCopy.attachments.remove}
            variant="unstyled"
        >
            <Icon icon={IconType.CLOSE} size="sm" />
        </TooltipIconButton>
    </AttachmentPrimitive.Remove>
);

export const UserMessageAttachments: React.FC = () => (
    <div className="col-span-full col-start-1 row-start-1 flex w-full flex-row justify-end gap-2 empty:hidden">
        <MessagePrimitive.Attachments>
            {() => <AttachmentUI />}
        </MessagePrimitive.Attachments>
    </div>
);

export const ComposerAttachments: React.FC = () => (
    <div className="flex w-full flex-row items-center gap-2 overflow-x-auto empty:hidden">
        <ComposerPrimitive.Attachments>
            {() => <AttachmentUI />}
        </ComposerPrimitive.Attachments>
    </div>
);

export const ComposerAddAttachment: React.FC = () => (
    <ComposerPrimitive.AddAttachment asChild={true}>
        <TooltipIconButton
            side="bottom"
            tooltip={chatCopy.composer.addAttachment}
        >
            <Icon icon={IconType.PLUS} size="sm" />
        </TooltipIconButton>
    </ComposerPrimitive.AddAttachment>
);
