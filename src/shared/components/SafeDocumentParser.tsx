import { sanitizeHtmlRich } from '@/shared/security/htmlSanitizer';
import { DocumentParser } from '@aragon/gov-ui-kit';
import type React from 'react';

type DocumentParserProps = React.ComponentProps<typeof DocumentParser>;

export const SafeDocumentParser: React.FC<DocumentParserProps> = (props) => {
    const { document, ...rest } = props;

    const sanitized = typeof document === 'string' ? sanitizeHtmlRich(document) : document;

    return <DocumentParser {...rest} document={sanitized} />;
};
