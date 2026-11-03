import path from 'node:path';
import type {
    Link,
    List,
    ListItem,
    Paragraph,
    PhrasingContent,
    Root,
} from 'mdast';

// On the landing pages (the index.md of the root and of every area), a list whose every item leads
// with a link is navigation: it is rendered as the card grid of docs.aragon.org instead of a bullet
// list. The item's link becomes the card title, the rest of its first paragraph, minus the dash
// that separates them in the knowledge base (`[Account](/accounts/account) — the vocabulary…`),
// the card body. Other pages, and lists with any other item, are left as they are.

const cardsClass = 'link-cards';
const cardClass = 'link-card';
const titleClass = 'link-card-title';
const bodyClass = 'link-card-body';

const separatorPattern = /^\s*(?:—|–|-|:)\s*/;

interface IVFile {
    path?: string;
    history?: string[];
}

interface IParent {
    children?: unknown[];
}

const isLandingPage = (file: IVFile): boolean => {
    const filePath = file.path ?? file.history?.[0];

    return filePath != null && path.basename(filePath) === 'index.md';
};

// The link an item leads with: bare, or wrapped in strong (`**[Accounts](/accounts)** — …`).
const leadingLink = (item: ListItem): Link | undefined => {
    const [first] = item.children;

    if (first?.type !== 'paragraph') {
        return undefined;
    }

    const [lead] = first.children;

    if (lead?.type === 'link') {
        return lead;
    }

    if (
        lead?.type === 'strong' &&
        lead.children.length === 1 &&
        lead.children[0].type === 'link'
    ) {
        return lead.children[0];
    }

    return undefined;
};

const withClass = <TNode extends { data?: unknown }>(
    node: TNode,
    hName: string,
    className: string,
): TNode => {
    node.data = {
        ...(node.data as object | undefined),
        hName,
        hProperties: { className: [className] },
    };

    return node;
};

// The text after the separator, as a sentence: the lists write `— the vocabulary…`.
const toSentence = (value: string): string => {
    const text = value.replace(separatorPattern, '');

    return text.charAt(0).toUpperCase() + text.slice(1);
};

// The description of a card: the first paragraph after its link, without the leading separator.
const toBody = (rest: PhrasingContent[]): Paragraph | undefined => {
    const [first, ...others] = rest;
    const children =
        first?.type === 'text'
            ? [{ ...first, value: toSentence(first.value) }, ...others]
            : rest;
    const content = children.filter(
        (child) => child.type !== 'text' || child.value.trim() !== '',
    );

    if (content.length === 0) {
        return undefined;
    }

    const body: Paragraph = { type: 'paragraph', children: content };

    return withClass(body, 'p', bodyClass);
};

const toCard = (item: ListItem, link: Link) => {
    const [first, ...others] = item.children as [
        Paragraph,
        ...ListItem['children'],
    ];
    const [, ...rest] = first.children;
    const title: Paragraph = { type: 'paragraph', children: [link] };
    const body = toBody(rest);

    withClass(title, 'p', titleClass);

    item.children = [title, ...(body == null ? [] : [body]), ...others];
    // A tight item would lose its paragraphs (and their classes) to the HTML conversion.
    item.spread = true;
    withClass(item, 'div', cardClass);
};

const toCards = (list: List): boolean => {
    const links = list.children.map(leadingLink);

    if (
        list.ordered ||
        links.length === 0 ||
        links.some((link) => link == null)
    ) {
        return false;
    }

    list.children.forEach((item, index) => {
        toCard(item, links[index] as Link);
    });
    list.spread = true;
    withClass(list, 'div', cardsClass);

    return true;
};

const visit = (node: IParent) => {
    for (const child of node.children ?? []) {
        const content = child as { type?: string } & IParent;

        if (content.type === 'list' && toCards(content as List)) {
            continue;
        }

        visit(content);
    }
};

/**
 * Remark plugin: the link lists of landing pages become card grids (see the comment above).
 */
export const remarkLinkCards = () => (tree: Root, file: IVFile) => {
    if (isLandingPage(file)) {
        visit(tree);
    }
};
