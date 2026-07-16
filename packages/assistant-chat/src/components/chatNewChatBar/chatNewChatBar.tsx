import { Button } from '@aragon/gov-ui-kit';
import { useAssistantChatContext } from '../../controller';

// One ticket = one chat: once the request is created the composer is replaced by this bar and
// a fresh request starts through an explicit new chat.
export const ChatNewChatBar: React.FC = () => {
    const { startNewChat } = useAssistantChatContext();

    return (
        <div className="flex flex-none flex-col gap-2 border-neutral-100 border-t px-5 pt-3.5 pb-4">
            <Button onClick={startNewChat} size="md" variant="primary">
                Start new chat
            </Button>
            <p className="text-center text-neutral-500 text-xs leading-normal">
                This chat is linked to the created request. Need something else?
                Start a new chat.
            </p>
        </div>
    );
};
