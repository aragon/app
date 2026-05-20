export enum DelegateStatementServiceKey {
    DELEGATE_STATEMENT = 'DELEGATE_STATEMENT',
}

export const delegateStatementServiceKeys = {
    delegateStatement: (cid: string) => [
        DelegateStatementServiceKey.DELEGATE_STATEMENT,
        cid,
    ],
};
