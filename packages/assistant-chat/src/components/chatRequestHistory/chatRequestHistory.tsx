import { Tag } from '@aragon/gov-ui-kit';
import { chatCopy } from '../../copy';
import { useRequestHistory } from '../../requests';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
});

const formatCreatedAt = (createdAt: string): string => {
    const date = new Date(createdAt);

    return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
};

// The requests filed from this device, as a view of their own reached from the link under the
// composer. The entries carry the reference to quote when following up — they deliberately do not
// link out (the tickets live in a Linear workspace the user has no access to), and the
// conversations themselves are not restorable, they live for the length of a session.
export const ChatRequestHistory: React.FC = () => {
    const requestHistory = useRequestHistory();

    if (requestHistory.length === 0) {
        return (
            <p className="flex flex-1 items-center justify-center p-6 text-center type-body-compact--component-note text-neutral-400">
                {chatCopy.requestHistory.empty}
            </p>
        );
    }

    return (
        <div className="flex min-h-0 flex-1 [scrollbar-width:none] flex-col gap-2 overflow-y-auto overscroll-contain p-4 [&::-webkit-scrollbar]:hidden">
            {requestHistory.map((entry) => (
                <div
                    className="flex flex-none items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-3 shadow-neutral"
                    key={entry.identifier}
                >
                    <Tag label={entry.identifier} variant="primary" />
                    <span className="min-w-0 flex-1 truncate type-title-item--chat text-neutral-800">
                        {entry.summary}
                    </span>
                    <span className="flex-none type-supporting--compact-detail text-neutral-400">
                        {formatCreatedAt(entry.createdAt)}
                    </span>
                </div>
            ))}
        </div>
    );
};
