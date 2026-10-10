---
"@aragon/gov-ui-kit": patch
---

Document usage notes in the JSDoc of 31 components. They show in IDE hover and, except on the seven compound namespaces, at the top of each Storybook docs page. They cover contracts the props table doesn't show: controlled state, required parents and providers, render conditions and layout defaults.

Document the 11 compound namespaces that had no JSDoc (`Accordion`, `Dropdown`, `DefinitionList`, `ProposalVotingProgress` and the `*DataListItem` families). Storybook's component manifest can now match their members and lists their props. Accordion's members now use their export names as `displayName` (`AccordionItemContent` showed as `Accordion.Content`).
