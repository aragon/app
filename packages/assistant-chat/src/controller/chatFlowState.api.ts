/**
 * Derived state of the intake flow, driving which panels the widget renders:
 * - `idle`: fresh session, no user message yet;
 * - `chatting`: conversation ongoing, no ticket action in flight;
 * - `previewing`: the ticket preview is being prepared;
 * - `previewUnclear`: the conversation does not describe an actionable request yet;
 * - `previewReady`: the preview is up for review, sending is offered;
 * - `creatingIssue`: issue creation request in flight;
 * - `issueCreated`: issue created, next message starts a new session;
 * - `issueError`: issue creation failed, retry keeps the session.
 */
export type ChatFlowState =
    | 'idle'
    | 'chatting'
    | 'previewing'
    | 'previewUnclear'
    | 'previewReady'
    | 'creatingIssue'
    | 'issueCreated'
    | 'issueError';
