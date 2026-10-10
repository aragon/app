import { DefinitionListContainer } from './definitionListContainer';
import { DefinitionListItem } from './definitionListItem';

/**
 * Term/definition pairs: `DefinitionList.Container` renders a `<dl>` of `DefinitionList.Item`s, each a `<dt>` term and
 * `<dd>` definition.
 */
export const DefinitionList = {
    Container: DefinitionListContainer,
    Item: DefinitionListItem,
};

export * from './definitionListContainer';
export * from './definitionListItem';
