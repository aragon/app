// Fixed assistant replies for hard session limits — no model call is involved. Off-topic refusals
// are handled by the agent's system prompt instead (a cheap short generation), not here.
export const turnLimitMessage =
    'This conversation has reached its length limit. Please start a new conversation to continue.';

export const tokenBudgetMessage =
    'This conversation has reached its size limit. Please start a new conversation to continue.';
