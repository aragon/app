import { AvatarIcon, Button, Heading, IconType } from '@aragon/gov-ui-kit';
import { useAssistantChatContext } from '../../controller';

export interface IChatHeaderProps {
    /**
     * Called when the close button is pressed.
     */
    onClose: () => void;
}

export const ChatHeader: React.FC<IChatHeaderProps> = (props) => {
    const { onClose } = props;

    const { supportPortalUrl } = useAssistantChatContext();

    return (
        <div className="relative flex flex-none items-center gap-2.5 bg-gradient-to-b from-neutral-50 to-transparent py-3 pr-13 pl-5">
            <AvatarIcon icon={IconType.FEEDBACK} size="md" variant="primary" />
            <Heading as="h2" size="h4">
                Aragon Support Assistant
            </Heading>
            {/* Always-visible escape hatch: the classic support form stays one click away in
                every flow state, not only on failures. */}
            {supportPortalUrl != null && (
                <a
                    className="ml-auto truncate font-normal text-neutral-500 text-sm leading-normal underline"
                    href={supportPortalUrl}
                    rel="noreferrer"
                    target="_blank"
                >
                    Support portal
                </a>
            )}
            <Button
                aria-label="Close"
                className="!absolute top-3 right-3"
                iconLeft={IconType.CLOSE}
                onClick={onClose}
                size="sm"
                variant="tertiary"
            />
        </div>
    );
};
