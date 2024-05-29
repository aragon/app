import { Wallet } from '../../wallet';
import { NavigationBase, type INavigationBaseProps } from '../navigationBase';

export interface INavigationProcessProps extends INavigationBaseProps {}

export const NavigationProcess: React.FC<INavigationProcessProps> = () => {
    return (
        <NavigationBase containerClasses="flex flex-row items-center justify-between py-5">
            <div className="flex flex-col gap-0.5">
                <p className="text-base leading-tight text-neutral-800">Process name</p>
                <p className="text-sm leading-tight text-neutral-500">Patito DAO</p>
            </div>
            <Wallet />
        </NavigationBase>
    );
};
