import { Wallet } from '../../wallet';
import { HeaderBase } from '../headerBase';

export interface IHeaderProcessProps {}

export const HeaderProcess: React.FC<IHeaderProcessProps> = () => {
    return (
        <HeaderBase className="flex flex-row items-center justify-between py-5">
            <div className="flex flex-col gap-0.5">
                <p className="text-base leading-tight text-neutral-800">Process name</p>
                <p className="text-sm leading-tight text-neutral-500">Patito DAO</p>
            </div>
            <Wallet />
        </HeaderBase>
    );
};
