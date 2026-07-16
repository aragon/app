import { AlertCard, Button, IconType } from '@aragon/gov-ui-kit';
import { useAssistantChatContext } from '../../controller';
import { chatCopy, supportEmailHref } from '../../copy';
import { getAssistantErrorText } from '../../transport';

export const ChatErrorPanel: React.FC = () => {
    const { flowState, issueError, createIssue } = useAssistantChatContext();

    if (flowState !== 'issueError') {
        return null;
    }

    const description = getAssistantErrorText(
        issueError?.code,
        chatCopy.errorPanel.issueErrorFallback,
    );

    return (
        <AlertCard
            className="self-stretch"
            message={chatCopy.errorPanel.title}
            variant="critical"
        >
            <div className="flex flex-col items-start gap-2 pt-1">
                <p>{description}</p>
                <Button
                    iconLeft={IconType.RELOAD}
                    onClick={createIssue}
                    size="sm"
                    variant="secondary"
                >
                    {chatCopy.errorPanel.retry}
                </Button>
                <a
                    className="text-primary-400 text-sm leading-normal underline"
                    href={supportEmailHref}
                >
                    {chatCopy.errorPanel.emailEscapeHatch}
                </a>
            </div>
        </AlertCard>
    );
};
