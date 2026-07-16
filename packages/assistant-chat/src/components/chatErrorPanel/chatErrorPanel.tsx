import { AlertCard, Button, IconType } from '@aragon/gov-ui-kit';
import { supportEmail, supportEmailHref } from '../../constants';
import { useAssistantChatContext } from '../../controller';
import { getAssistantErrorText } from '../../transport';

export const ChatErrorPanel: React.FC = () => {
    const { flowState, issueError, createIssue } = useAssistantChatContext();

    if (flowState !== 'issueError') {
        return null;
    }

    const description = getAssistantErrorText(
        issueError?.code,
        'Nothing was lost. Check your connection and try again.',
    );

    return (
        <AlertCard
            className="self-stretch"
            message="We couldn't create your request"
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
                    Retry
                </Button>
                <a
                    className="text-primary-400 text-sm leading-normal underline"
                    href={supportEmailHref}
                >
                    …or email your request to {supportEmail} →
                </a>
            </div>
        </AlertCard>
    );
};
