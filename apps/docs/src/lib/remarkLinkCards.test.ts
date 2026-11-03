import type { List, Paragraph, Root } from 'mdast';
import { remarkLinkCards } from './remarkLinkCards';

const link = (text: string, url: string) => ({
    type: 'link' as const,
    url,
    children: [{ type: 'text' as const, value: text }],
});

const item = (children: Paragraph['children']) => ({
    type: 'listItem' as const,
    children: [{ type: 'paragraph' as const, children }],
});

const linkList = (): List => ({
    type: 'list',
    ordered: false,
    children: [
        item([
            link('Account', '/accounts/account'),
            { type: 'text', value: ' — the vocabulary of the account.' },
        ]),
        item([
            {
                type: 'strong',
                children: [link('Guides', '/guides')],
            },
            { type: 'text', value: ' — concrete tasks.' },
        ]),
        item([link('Safe', '/accounts/safe')]),
    ],
});

const transform = (tree: Root, filePath: string) => {
    remarkLinkCards()(tree, { path: filePath });

    return tree;
};

const dataOf = (node: { data?: unknown }) =>
    node.data as { hName?: string; hProperties?: { className?: string[] } };

describe('remarkLinkCards', () => {
    it('renders the link lists of a landing page as card grids', () => {
        const list = linkList();
        transform({ type: 'root', children: [list] }, 'content/docs/index.md');

        expect(dataOf(list)).toEqual({
            hName: 'div',
            hProperties: { className: ['link-cards'] },
        });
        expect(list.children.map((child) => dataOf(child).hName)).toEqual([
            'div',
            'div',
            'div',
        ]);
    });

    it('splits an item into the link title and the text after the dash, as a sentence', () => {
        const list = linkList();
        transform(
            { type: 'root', children: [list] },
            'content/docs/accounts/index.md',
        );

        const [title, body] = list.children[0].children as Paragraph[];
        expect(dataOf(title).hProperties?.className).toEqual([
            'link-card-title',
        ]);
        expect(title.children).toEqual([link('Account', '/accounts/account')]);
        expect(dataOf(body).hProperties?.className).toEqual(['link-card-body']);
        expect(body.children).toEqual([
            { type: 'text', value: 'The vocabulary of the account.' },
        ]);
    });

    it('unwraps a strong link and keeps an item without text to its title', () => {
        const list = linkList();
        transform({ type: 'root', children: [list] }, 'content/docs/index.md');

        const [strongTitle] = list.children[1].children as Paragraph[];
        expect(strongTitle.children).toEqual([link('Guides', '/guides')]);
        expect(list.children[2].children).toHaveLength(1);
    });

    it('leaves a list with an item that does not lead with a link', () => {
        const list = linkList();
        list.children.push(item([{ type: 'text', value: 'Plain text.' }]));
        transform({ type: 'root', children: [list] }, 'content/docs/index.md');

        expect(list.data).toBeUndefined();
        expect(list.children[0].children).toHaveLength(1);
    });

    it('leaves the lists of pages that are not landing pages', () => {
        const list = linkList();
        transform(
            { type: 'root', children: [list] },
            'content/docs/accounts/account.md',
        );

        expect(list.data).toBeUndefined();
    });

    it('reaches lists nested below other content', () => {
        const list = linkList();
        transform(
            {
                type: 'root',
                children: [{ type: 'blockquote', children: [list] }],
            },
            'content/docs/index.md',
        );

        expect(dataOf(list).hName).toBe('div');
    });
});
