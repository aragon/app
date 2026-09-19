# Documentation

Welcome to the documentation hub for the Aragon App web application. This document serves as a central repository for
coding guidelines, naming conventions, and other essential resources.

## Coding Guidelines

Ensure consistency and maintainability by following our coding guidelines:

- [Coding Guidelines](./codingGuidelines/codingGuidelines.md)
- [Naming Conventions](./codingGuidelines/namingConventions.md)
- [Pull Requests](./codingGuidelines/pullRequests.md)


## Design and interaction guidance

Use the maintained design-sync guide for component selection, composition,
interaction/domain behavior, styling, accessibility and implementation copy:

- [Design-sync usage conventions](../../../.design-sync/conventions.md) — the
  maintained entry point used by the App design surface.
- [GovKit source and Storybook](https://aragon.github.io/gov-ui-kit/) — current
  public component behavior, stories and props.

Ownership follows the source: GovKit owns reusable component contracts and
co-located stories/tests; the App owns product composition, form policy,
translations and domain side effects. Do not copy the selection guide into a
second handbook. The guide records the APP-726 artifact revision and baseline;
APP-1208 must reconcile it with the refreshed bundle.

## Project Docs

Check the project specific processes and guidelines below:

- [Data Fetching](./projectDocs/dataFetching.md)
- [Plugin Encapsulation](./projectDocs/pluginEncapsulation.md)
- [Project Structure](./projectDocs/projectStructure.md)
- [Releases](./projectDocs/releases.md)
- [Slot Integration Guide](./slots/overview.md)
- [Testing](./projectDocs/testing.md)
