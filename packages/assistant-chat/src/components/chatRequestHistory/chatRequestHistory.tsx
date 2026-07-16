import { Tag } from '@aragon/gov-ui-kit';
import { useAssistantChatContext } from '../../controller';
import { chatCopy } from '../../copy';

const maxVisibleEntries = 5;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
});

const formatCreatedAt = (createdAt: string): string => {
    const date = new Date(createdAt);

    return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
};

// Past requests of this device, shown on the idle screen so users can get back to a created
// ticket without digging through their email.
export const ChatRequestHistory: React.FC = () => {
    const { flowState, requestHistory } = useAssistantChatContext();

    if (flowState !== 'idle' || requestHistory.length === 0) {
        return null;
    }

    return (
        <div className="mt-2 flex flex-col gap-1.5 self-stretch">
            <p className="text-neutral-500 text-xs uppercase tracking-wide">
                {chatCopy.requestHistory.heading}
            </p>
            {requestHistory.slice(0, maxVisibleEntries).map((entry) => (
                <a
                    className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-0 px-2.5 py-2 transition-colors hover:border-neutral-200 hover:bg-neutral-50"
                    href={entry.url}
                    key={entry.identifier}
                    rel="noreferrer"
                    target="_blank"
                >
                    <Tag label={entry.identifier} variant="primary" />
                    <span className="min-w-0 flex-1 truncate text-neutral-800 text-xs">
                        {entry.summary}
                    </span>
                    <span className="flex-none text-neutral-300 text-xs">
                        {formatCreatedAt(entry.createdAt)}
                    </span>
                </a>
            ))}
        </div>
    );
};
