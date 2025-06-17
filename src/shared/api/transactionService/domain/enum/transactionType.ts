export enum TransactionType {
    DAO_CREATE = 'daoCreate',
    PROPOSAL_CREATE = 'proposalCreate',
    PROPOSAL_ADVANCE_STAGE = 'proposalAdvanceStage',
    PROPOSAL_VOTE = 'proposalVote',
    PROPOSAL_EXECUTE = 'proposalExecute',
    PROPOSAL_REPORT_RESULTS = 'proposalReportResults',
    TOKEN_LOCK = 'tokenLock',
    TOKEN_UNLOCK = 'tokenUnlock',
    TOKEN_WITHDRAW = 'tokenWithdraw',
}
