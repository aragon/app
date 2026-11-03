import type { ISite, ISitePage } from './buildContent';

// What a release changes on the site: its pages, by route, against the site of the previous
// release. A page counts as changed when what a reader sees of it does — its title, description
// or body; the "last updated" date follows a change and is not one.

export interface ISiteDiff {
    added: string[];
    changed: string[];
    removed: string[];
}

const listPages = (site: ISite): ISitePage[] =>
    [site.root, ...site.areas].flatMap((folder) => [
        ...(folder.index == null ? [] : [folder.index]),
        ...folder.pages,
    ]);

const readerView = (page: ISitePage): string =>
    JSON.stringify([page.title, page.description ?? '', page.body]);

/**
 * Routes added, changed and removed from `base` to `head`, sorted; without `base` (no previous
 * release) every page is added.
 */
export const diffSites = (base: ISite | undefined, head: ISite): ISiteDiff => {
    const basePages = new Map(
        (base == null ? [] : listPages(base)).map((page) => [
            page.route,
            readerView(page),
        ]),
    );
    const headPages = new Map(
        listPages(head).map((page) => [page.route, readerView(page)]),
    );
    const routes = (
        pages: Map<string, string>,
        keep: (route: string) => boolean,
    ) => [...pages.keys()].filter(keep).sort();

    return {
        added: routes(headPages, (route) => !basePages.has(route)),
        changed: routes(
            headPages,
            (route) =>
                basePages.has(route) &&
                basePages.get(route) !== headPages.get(route),
        ),
        removed: routes(basePages, (route) => !headPages.has(route)),
    };
};
