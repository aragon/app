import classNames from 'classnames';
import type { AssistantUIMessage } from '../../transport';

export interface IChatMessageItemProps {
    /**
     * Message to render; only its text parts are displayed.
     */
    message: AssistantUIMessage;
}

export const ChatMessageItem: React.FC<IChatMessageItemProps> = (props) => {
    const { message } = props;

    const isUser = message.role === 'user';

    const text = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('');

    return (
        <div
            className={classNames(
                'max-w-[85%] whitespace-pre-wrap px-3.5 py-2.5 text-sm leading-normal',
                {
                    'self-end rounded-tl-xl rounded-tr-xl rounded-br rounded-bl-xl bg-primary-400 text-neutral-0':
                        isUser,
                },
                {
                    'self-start rounded-tl-xl rounded-tr-xl rounded-br-xl rounded-bl bg-neutral-50 text-neutral-800':
                        !isUser,
                },
            )}
        >
            {text}
        </div>
    );
};
