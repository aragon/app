# Pull Requests

Follow the guidelines below when opening and merging pull requests:

- Subject line must be prefixed with a lowercase type (`fix`, `feat`, ..) followed by a colon and a space.
- The type `feat` must be used when a commit adds a new feature to the application or library.
- The type `fix` must be used when a commit represent a bug fix to your application or library.
- Types other than `feat` and `fix` may be used as defined in the [Angular convention](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type).
- When available, the related Jira ticket must be specified as scope and enclosed in parenthesis, e.g. `fix(APP-1234):`. Multiple Jira tickets must be specified as a comma-separated list , e.g. `fix(APP-12,APP-34):`.
- A description must follow the type/scope prefix and describes the code changes.
- The description must be capitalized and use the imperative mood.

**NOTE**: When merging a pull request containing only one commit, Github will suggest using the commit name instead of the PR name.
Ensure that the commit name follows the commit guidelines above.

## Examples:

```
feat(APP-12): Add Spanish language support ✅
fix: Allow proxy contracts to be removed in Smart Contract Compose ✅
fix(APP-36,APP-198): Prevent application from crashing when switching network ✅

Add Spanish language support ❌ (type is missing)
feat: add Spanish language support ❌ (description is not capitalized)
feat: Added Spanish language support ❌ (description does not use imperative mood)
fix: Wrong balance on DAO pages ❌ (description does not use imperative mood)
```
