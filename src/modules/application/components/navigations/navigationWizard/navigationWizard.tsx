import { Navigation, type INavigationContainerProps } from '../navigation';

export interface INavigationProcessProps extends INavigationContainerProps {}

export const NavigationWizard: React.FC<INavigationProcessProps> = () => {
    return (
        <Navigation.Container containerClasses="flex flex-row items-center justify-between py-5">
            <div className="flex flex-col gap-0.5">
                <p className="text-base leading-tight text-neutral-800">Title</p>
                <p className="text-sm leading-tight text-neutral-500">Subtitle</p>
            </div>
        </Navigation.Container>
    );
};
