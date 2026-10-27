import type { MetadataRoute } from 'next';
import { toCanonicalUrl } from '../lib/site';
import { source } from '../lib/source';

export const dynamic = 'force-static';

const sitemap = (): MetadataRoute.Sitemap =>
    source.getPages().map((page) => ({ url: toCanonicalUrl(page.url) }));

export default sitemap;
