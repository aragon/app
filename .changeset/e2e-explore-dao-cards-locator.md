---
"@aragon/app": patch
---

Fix the explore smoke tests' DAO card locator: gov-ui-kit 2.11.1 renders a DataListItem link as an empty overlay named via aria-labelledby, so the card content is no longer inside the link and the tests matched nothing.
