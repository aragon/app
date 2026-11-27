import { Icon, IconType } from '@aragon/gov-ui-kit';
import {
    type CodeHeaderProps,
    MarkdownTextPrimitive,
    unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
    useIsMarkdownCodeBlock,
} from '@assistant-ui/react-markdown';
import classNames from 'classnames';
import { memo, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { chatCopy } from '../../copy';
import { TooltipIconButton } from '../tooltipIconButton';
import { resolveAppLink } from './resolveAppLink';

// Port of the assistant-ui registry markdown-text: the assistant reply rendered as markdown with
// the registry's element styling remapped to the Aragon theme tokens. Deliberate deviations:
// links open in a new tab (the widget lives in a side panel), and the streaming-dot stylesheet
// is skipped — the widget has its own typing indicator. GFM is on for its autolinks: a bare URL
// in a reply is a link, not text to copy by hand. The table styling GFM makes possible is kept
// minimal — the prompt asks for sentences or a list instead, so a table is the exception.

const useCopyToClipboard = ({ copiedDuration = 3000 } = {}) => {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = (value: string) => {
        if (
            !value ||
            typeof navigator === 'undefined' ||
            !navigator.clipboard
        ) {
            return;
        }

        navigator.clipboard.writeText(value).then(
            () => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), copiedDuration);
            },
            () => undefined,
        );
    };

    return { isCopied, copyToClipboard };
};

const CodeHeader: React.FC<CodeHeaderProps> = ({ language, code }) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard();

    const onCopy = () => {
        if (!code || isCopied) {
            return;
        }
        copyToClipboard(code);
    };

    return (
        <div className="mt-related flex items-center justify-between rounded-t-xl border border-b-0 border-surface-secondary bg-surface-secondary px-inset-surface-flat--fixed-14 py-inset-tight--fixed-6 type-caption--unstepped">
            <span className="text-surface-secondary lowercase">{language}</span>
            <TooltipIconButton
                onClick={onCopy}
                tooltip={chatCopy.markdown.copyCode}
            >
                <Icon
                    icon={isCopied ? IconType.CHECKMARK : IconType.COPY}
                    size="sm"
                />
            </TooltipIconButton>
        </div>
    );
};

const Code: React.FC<React.ComponentProps<'code'>> = ({
    className,
    ...props
}) => {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
        <code
            className={classNames(
                !isCodeBlock &&
                    'rounded-md bg-surface-tertiary px-inset-tight--fixed-6 py-inset-tight type-mono text-[0.85em]',
                className,
            )}
            {...props}
        />
    );
};

const defaultComponents = memoizeMarkdownComponents({
    h1: ({ className, ...props }) => (
        <h1
            className={classNames(
                'mt-group--fixed-20 mb-related--fixed-8 type-title-page--chat-markdown type-strong first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h2: ({ className, ...props }) => (
        <h2
            className={classNames(
                'mt-group--fixed-20 mb-related--fixed-8 type-title-section--chat-markdown type-strong first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }) => (
        <h3
            className={classNames(
                'mt-group mb-tight--fixed-6 type-title-group--chat-markdown type-strong first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h4: ({ className, ...props }) => (
        <h4
            className={classNames(
                'mt-group--fixed-14 mb-tight type-title-item--chat-markdown first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h5: ({ className, ...props }) => (
        <h5
            className={classNames(
                'mt-related mb-tight type-supporting--chat-markdown type-strong first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h6: ({ className, ...props }) => (
        <h6
            className={classNames(
                'mt-related mb-tight type-caption--compact-label first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    p: ({ className, ...props }) => (
        <p
            className={classNames(
                'my-related type-body-compact--chat-message first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    a: ({ className, href, ...props }) => (
        <a
            className={classNames(
                'text-link-default underline underline-offset-2 hover:text-link-hover',
                className,
            )}
            href={resolveAppLink(href, globalThis.location?.origin)}
            rel="noreferrer"
            target="_blank"
            {...props}
        />
    ),
    blockquote: ({ className, ...props }) => (
        <blockquote
            className={classNames(
                'my-related border-s-2 border-surface-secondary-panel ps-inset-item-flat text-surface-secondary',
                className,
            )}
            {...props}
        />
    ),
    ul: ({ className, ...props }) => (
        <ul
            className={classNames(
                'my-related ms-5 list-disc marker:text-surface-tertiary-hint [&>li]:mt-tight',
                className,
            )}
            {...props}
        />
    ),
    ol: ({ className, ...props }) => (
        <ol
            className={classNames(
                'my-related ms-5 list-decimal marker:text-surface-tertiary-hint [&>li]:mt-tight',
                className,
            )}
            {...props}
        />
    ),
    hr: ({ className, ...props }) => (
        <hr
            className={classNames(
                'my-related border-surface-secondary',
                className,
            )}
            {...props}
        />
    ),
    li: ({ className, ...props }) => (
        <li
            className={classNames('type-body-compact--chat-message', className)}
            {...props}
        />
    ),
    strong: ({ className, ...props }) => (
        <strong className={classNames('type-strong', className)} {...props} />
    ),
    sup: ({ className, ...props }) => (
        <sup
            className={classNames(
                '[&>a]:type-caption--unstepped [&>a]:no-underline',
                className,
            )}
            {...props}
        />
    ),
    pre: ({ className, ...props }) => (
        <pre
            className={classNames(
                'overflow-x-auto rounded-t-none rounded-b-xl border border-t-0 border-surface-secondary bg-surface-secondary p-inset-surface-flat--fixed-14 text-[13px] leading-relaxed',
                className,
            )}
            {...props}
        />
    ),
    table: ({ className, ...props }) => (
        <div className="my-related overflow-x-auto">
            <table
                className={classNames(
                    'w-full border-collapse type-body-compact--component-note',
                    className,
                )}
                {...props}
            />
        </div>
    ),
    th: ({ className, ...props }) => (
        <th
            className={classNames(
                'border border-surface-secondary bg-surface-secondary px-inset-tight--fixed-8 py-inset-tight--fixed-4 text-left type-strong',
                className,
            )}
            {...props}
        />
    ),
    td: ({ className, ...props }) => (
        <td
            className={classNames(
                'border border-surface-secondary px-inset-tight--fixed-8 py-inset-tight--fixed-4 align-top',
                className,
            )}
            {...props}
        />
    ),
    // A reply never needs an image, and an image tag would make the reader's browser fetch a URL
    // of the model's choosing.
    img: () => null,
    code: Code,
    CodeHeader,
});

const remarkPlugins = [remarkGfm];

const MarkdownTextImpl: React.FC = () => (
    <MarkdownTextPrimitive
        components={defaultComponents}
        defer={true}
        remarkPlugins={remarkPlugins}
    />
);

export const MarkdownText = memo(MarkdownTextImpl);
