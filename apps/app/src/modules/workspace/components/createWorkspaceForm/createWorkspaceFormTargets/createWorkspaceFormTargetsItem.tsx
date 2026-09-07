import { Button, Card, Dropdown, IconType } from '@aragon/gov-ui-kit';
import { useTranslations } from '@/shared/components/translationsProvider';
import { CreateWorkspaceFormNetworkAddressFields } from '../createWorkspaceFormNetworkAddressFields';

export interface ICreateWorkspaceFormTargetsItemProps {
    /**
     * Name of the targets field-array.
     */
    name: string;
    /**
     * Index of the target in the list.
     */
    index: number;
    /**
     * Callback to remove the target from the list.
     */
    remove: (index: number) => void;
}

export const CreateWorkspaceFormTargetsItem: React.FC<
    ICreateWorkspaceFormTargetsItemProps
> = (props) => {
    const { name, index, remove } = props;

    const { t } = useTranslations();

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <div className="min-w-0 grow">
                <CreateWorkspaceFormNetworkAddressFields
                    index={index}
                    listName={name}
                />
            </div>
            <div className="mt-0 md:mt-9">
                <Dropdown.Container
                    constrainContentWidth={false}
                    customTrigger={
                        <Button
                            iconLeft={IconType.DOTS_VERTICAL}
                            size="lg"
                            variant="tertiary"
                        />
                    }
                    size="md"
                >
                    <Dropdown.Item onClick={() => remove(index)}>
                        {t('app.workspace.createWorkspaceForm.targets.remove')}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
        </Card>
    );
};
