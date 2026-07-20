/**
 * Type surface of the synced design bundle. The bundle merges the real
 * gov-ui-kit package with the app components from app-entry.ts under the
 * single `GovUiKit` global, and previews import that merged surface as
 * '@aragon/gov-ui-kit'. tsconfig.json maps the specifier here so previews
 * type-check against the same surface they run against. Never executed.
 */
export * from '@aragon/gov-ui-kit-original';
export * from './app-entry';
