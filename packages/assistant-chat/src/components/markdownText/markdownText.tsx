import { Icon, IconType } from '@aragon/gov-ui-kit';
import {
    type CodeHeaderProps,
    MarkdownTextPrimitive,
    unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
    useIsMarkdownCodeBlock,
} from '@assistant-ui/react-markdown';
import classNames from 'classnames';
import { memo, useState } from 'react';
import { chatCopy } from '../../copy';
import { TooltipIconButton } from '../tooltipIconButton';

// Port of the assistant-ui registry markdown-text: the assistant reply rendered as markdown with
// the registry's element styling remapped to the Aragon theme tokens. Deliberate deviations:
// links open in a new tab (the widget lives in a side panel), remark-gfm is left out (plain
// markdown covers support answers; one dependency less) along with the table styles only GFM
// could produce, and the streaming-dot stylesheet is skipped — the widget has its own typing
// indicator.

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
        <div className="mt-3 flex items-center justify-between rounded-t-xl border border-neutral-100 border-b-0 bg-neutral-50 px-3.5 py-1.5 text-xs">
            <span className="font-medium text-neutral-500 lowercase">
                {language}
            </span>
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
                    'rounded-md bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em]',
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
                'mt-5 mb-2 font-semibold text-xl first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h2: ({ className, ...props }) => (
        <h2
            className={classNames(
                'mt-5 mb-2 font-semibold text-lg first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h3: ({ className, ...props }) => (
        <h3
            className={classNames(
                'mt-4 mb-1.5 font-semibold text-base first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h4: ({ className, ...props }) => (
        <h4
            className={classNames(
                'mt-3.5 mb-1 font-medium text-base first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h5: ({ className, ...props }) => (
        <h5
            className={classNames(
                'mt-3 mb-1 font-semibold text-sm first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    h6: ({ className, ...props }) => (
        <h6
            className={classNames(
                'mt-3 mb-1 font-medium text-sm first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    p: ({ className, ...props }) => (
        <p
            className={classNames(
                'my-3 leading-relaxed first:mt-0 last:mb-0',
                className,
            )}
            {...props}
        />
    ),
    a: ({ className, ...props }) => (
        <a
            className={classNames(
                'text-primary-400 underline underline-offset-2 hover:text-primary-500',
                className,
            )}
            rel="noreferrer"
            target="_blank"
            {...props}
        />
    ),
    blockquote: ({ className, ...props }) => (
        <blockquote
            className={classNames(
                'my-3 border-neutral-200 border-s-2 ps-4 text-neutral-500',
                className,
            )}
            {...props}
        />
    ),
    ul: ({ className, ...props }) => (
        <ul
            className={classNames(
                'my-3 ms-5 list-disc marker:text-neutral-300 [&>li]:mt-1',
                className,
            )}
            {...props}
        />
    ),
    ol: ({ className, ...props }) => (
        <ol
            className={classNames(
                'my-3 ms-5 list-decimal marker:text-neutral-300 [&>li]:mt-1',
                className,
            )}
            {...props}
        />
    ),
    hr: ({ className, ...props }) => (
        <hr
            className={classNames('my-3 border-neutral-100', className)}
            {...props}
        />
    ),
    li: ({ className, ...props }) => (
        <li className={classNames('leading-relaxed', className)} {...props} />
    ),
    strong: ({ className, ...props }) => (
        <strong className={classNames('font-semibold', className)} {...props} />
    ),
    sup: ({ className, ...props }) => (
        <sup
            className={classNames(
                '[&>a]:text-xs [&>a]:no-underline',
                className,
            )}
            {...props}
        />
    ),
    pre: ({ className, ...props }) => (
        <pre
            className={classNames(
                'overflow-x-auto rounded-t-none rounded-b-xl border border-neutral-100 border-t-0 bg-neutral-50 p-3.5 text-[13px] leading-relaxed',
                className,
            )}
            {...props}
        />
    ),
    code: Code,
    CodeHeader,
});

const MarkdownTextImpl: React.FC = () => (
    <MarkdownTextPrimitive components={defaultComponents} defer={true} />
);

export const MarkdownText = memo(MarkdownTextImpl);
