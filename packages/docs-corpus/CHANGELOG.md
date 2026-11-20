# @aragon/docs-corpus

## 0.1.1

### Patch Changes

- [#1555](https://github.com/aragon/app/pull/1555) [`e439562`](https://github.com/aragon/app/commit/e439562bfcbae484ff86c45fb9a5ff4ef0bafc8c) Thanks [@tyhonchik](https://github.com/tyhonchik)! - The heading pattern of the corpus loader no longer backtracks quadratically on long runs of spaces (CodeQL `js/polynomial-redos`).

## 0.1.0

### Minor Changes

- [#1473](https://github.com/aragon/app/pull/1473) [`5637f3b`](https://github.com/aragon/app/commit/5637f3ba6f1ba176ff9268b3676dbfdbb98dd845) Thanks [@tyhonchik](https://github.com/tyhonchik)! - Move the knowledge-base loader (the fetch of aragon/platform-doc, the published-page filter and the link rules) into `@aragon/docs-corpus`, a source-only workspace package the docs site will share with the assistant, so both publish the same pages. The assistant's documentation index is built from it unchanged; the per-environment corpus modes of both consumers now sit in one table there.
