import { AccordionContainer } from './accordionContainer';
import { AccordionItem } from './accordionItem';
import { AccordionItemContent } from './accordionItemContent';
import { AccordionItemHeader } from './accordionItemHeader';

/**
 * Expandable sections built on Radix Accordion: `Accordion.Container` holds `Accordion.Item`s, each with an
 * `Accordion.ItemHeader` trigger and an `Accordion.ItemContent` panel.
 */
export const Accordion = {
    Container: AccordionContainer,
    Item: AccordionItem,
    ItemHeader: AccordionItemHeader,
    ItemContent: AccordionItemContent,
};

export * from './accordionContainer';
export * from './accordionItem';
export * from './accordionItemContent';
export * from './accordionItemHeader';
