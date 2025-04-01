import { sitemapUtils } from '@/modules/application/utils/sitemapUtils';
import type { MetadataRoute } from 'next';
import { NextResponse } from 'next/server';

export async function GET() {
    const sitemapIndex: MetadataRoute.Sitemap = await sitemapUtils.generateRootSitemap();

    if (!sitemapIndex.length) {
        return new NextResponse('No sitemap data found', { status: 404 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
                <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                  ${sitemapIndex
                      .map(
                          (page) => `
                            <sitemap>
                                <loc>${page.url}</loc>
                                ${page.lastModified ? `<lastmod>${new Date(page.lastModified).toISOString()}</lastmod>` : ''}
                                <changefreq>${page.changeFrequency ?? 'daily'}</changefreq>
                                <priority>${page.priority?.toString() ?? '0.8'}</priority>
                            </sitemap>`,
                      )
                      .join('\n')}
                </sitemapindex>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=86400, stale-while-revalidate',
        },
    });
}
