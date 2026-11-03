/**
 * Search parameter the vote list keeps its selected plugin tab in.
 *
 * Kept out of `voteList.tsx`: that module is a client one, and a server component importing a value from it receives a
 * client reference rather than the string, so `searchParams[voteListFilterParam]` would always be undefined.
 */
export const voteListFilterParam = 'vote';
