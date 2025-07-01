import type { IToken } from '@/modules/finance/api/financeService';

export interface ICapitalDistributorClaimDialogDetailsInfoProps {
    /**
     * Campaign info to be displayed.
     */
    info: { label: string; value: string | null; token?: IToken };
}

export const CapitalDistributorClaimDialogDetailsInfo: React.FC<ICapitalDistributorClaimDialogDetailsInfoProps> = (
    props,
) => {
    const { info } = props;

    const { label, value } = info;

    return (
        <div className="flex grow basis-0 flex-col gap-1">
            <p className="text-sm leading-tight font-normal text-neutral-500">{label}</p>
            <p className="text-base leading-normal font-normal text-neutral-800 first-letter:uppercase">{value}</p>
        </div>
    );
};
