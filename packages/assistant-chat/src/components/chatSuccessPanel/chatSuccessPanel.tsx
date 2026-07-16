import { Card, Heading, IllustrationObject, Tag } from '@aragon/gov-ui-kit';
import { useAssistantChatContext } from '../../controller';

export const ChatSuccessPanel: React.FC = () => {
    const { flowState, issue } = useAssistantChatContext();

    if (flowState !== 'issueCreated' || issue == null) {
        return null;
    }

    return (
        <Card className="flex flex-col items-center gap-2 self-stretch border border-neutral-100 p-4 text-center">
            <IllustrationObject className="size-14" object="SUCCESS" />
            <Heading as="h3" size="h5">
                Request created
            </Heading>
            <Tag label={issue.identifier} variant="primary" />
            <p className="text-neutral-500 text-sm leading-normal">
                If you left an email, we&apos;ll send updates there.
            </p>
        </Card>
    );
};
