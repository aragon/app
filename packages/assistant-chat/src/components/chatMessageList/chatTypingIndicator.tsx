import { StatePingAnimation } from '@aragon/gov-ui-kit';

export const ChatTypingIndicator: React.FC = () => (
    <div
        aria-label="Assistant is typing"
        className="flex items-center gap-1 self-start rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl bg-neutral-50 px-3.5 py-3"
        role="status"
    >
        <StatePingAnimation variant="primary" />
    </div>
);
