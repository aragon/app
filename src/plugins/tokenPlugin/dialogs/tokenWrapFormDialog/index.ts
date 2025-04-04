import dynamic from 'next/dynamic';

export const TokenWrapFormDialogApprove = dynamic(() =>
    import('./tokenWrapFormDialogApprove').then((mod) => mod.TokenWrapFormDialogApprove),
);

export type { ITokenWrapFormDialogActionParams, ITokenWrapFormDialogActionProps } from './tokenWrapFormDialogAction';

export type { ITokenWrapFormDialogApproveParams, ITokenWrapFormDialogApproveProps } from './tokenWrapFormDialogApprove';

export const TokenWrapFormDialogAction = dynamic(() =>
    import('./tokenWrapFormDialogAction').then((mod) => mod.TokenWrapFormDialogAction),
);
