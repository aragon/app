import {
    AvatarIcon,
    Button,
    IconType,
    Progress,
    Spinner,
} from '@aragon/gov-ui-kit';
import classNames from 'classnames';
import { useAssistantChatContext } from '../../controller';
import { formatFileSize } from './formatFileSize';

export const ChatAttachmentList: React.FC = () => {
    const { attachments, removeFile } = useAssistantChatContext();

    if (attachments.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1.5">
            {attachments.map((attachment) => (
                <div
                    className={classNames(
                        'flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-0 px-2.5 py-1.5',
                        { 'opacity-50': attachment.status === 'removing' },
                    )}
                    key={attachment.id}
                >
                    <AvatarIcon icon={IconType.COPY} size="sm" />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-baseline gap-1.5">
                            <p className="truncate text-neutral-800 text-xs">
                                {attachment.filename}
                            </p>
                            <p className="flex-none text-neutral-500 text-xs">
                                {formatFileSize(attachment.size)}
                            </p>
                        </div>
                        {attachment.status === 'uploading' && (
                            <Progress
                                size="sm"
                                value={Math.round(attachment.progress * 100)}
                            />
                        )}
                        {attachment.status === 'error' && (
                            <p className="text-critical-800 text-xs">
                                Upload failed
                            </p>
                        )}
                    </div>
                    {attachment.status === 'removing' ? (
                        <div aria-label="Removing file" role="status">
                            <Spinner size="sm" variant="neutral" />
                        </div>
                    ) : (
                        <Button
                            aria-label="Remove file"
                            iconLeft={IconType.CLOSE}
                            onClick={() => removeFile(attachment.id)}
                            size="sm"
                            variant="tertiary"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};
