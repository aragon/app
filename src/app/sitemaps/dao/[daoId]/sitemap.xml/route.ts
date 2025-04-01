import { sitemapUtils } from '@/modules/application/utils/sitemapUtils';
import type { MetadataRoute } from 'next';
import { NextResponse } from 'next/server';

export async function GET(_req: Request, { params }: { params: { daoId: string } }) {
    const entries: MetadataRoute.Sitemap = await sitemapUtils.generateDaoSitemap(params.daoId);

    if (!entries.length) {
        return new NextResponse('No sitemap entries found.', { status: 404 });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
                  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                  ${entries
                      .map(
                          (entry) =>
                              `<url>
                                  <loc>${entry.url}</loc>
                                  <lastmod>${
                                      entry.lastModified instanceof Date
                                          ? entry.lastModified.toISOString()
                                          : new Date(entry.lastModified ?? Date.now()).toISOString()
                                  }</lastmod>
                                  <changefreq>${entry.changeFrequency ?? 'daily'}</changefreq>
                                  <priority>${entry.priority?.toString() ?? '0.8'}</priority>
                              </url>`,
                      )
                      .join('\n')}
                  </urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=86400, stale-while-revalidate',
        },
    });
}
