'use client';

import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { ComponentProps } from 'react';
import { toAppRelativeLink } from '../lib/appLink';
import { useAppOrigin } from '../lib/useAppOrigin';

const DefaultLink = defaultMdxComponents.a;

/**
 * Link of a page body. An absolute link to the app's origin is a plain anchor in the same tab,
 * host-relative so a reader stays on the host that serves the site (the Next link would add the
 * base path). A page of the app takes the app origin when the site is opened outside the apps; a
 * page of the site is served by every host. Every other link keeps the default rendering.
 */
export const MdxLink = (props: ComponentProps<'a'>) => {
    const appOrigin = useAppOrigin();
    const appLink = toAppRelativeLink(props.href);

    if (appLink == null) {
        return <DefaultLink {...props} />;
    }

    const origin = appLink.isSite ? '' : appOrigin;

    return <a {...props} href={`${origin}${appLink.href}`} />;
};
