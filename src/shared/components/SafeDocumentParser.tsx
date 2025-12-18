import { DocumentParser } from '@aragon/gov-ui-kit';
import type { ComponentProps, FC } from 'react';
import { sanitizeHtmlRich } from '@/shared/security';

type DocumentParserProps = ComponentProps<typeof DocumentParser>;

export const SafeDocumentParser: FC<DocumentParserProps> = (props) => {
    const { document, ...rest } = props;

    const sanitized = typeof document === 'string' ? sanitizeHtmlRich(document) : document;

    return <DocumentParser {...rest} document={sanitized} />;
};
