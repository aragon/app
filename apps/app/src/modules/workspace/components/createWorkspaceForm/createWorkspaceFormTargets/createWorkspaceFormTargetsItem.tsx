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
        <Card className="flex flex-col gap-related--12-8 p-inset-surface-wide shadow-surface-sm md:flex-row">
            <div className="min-w-0 grow">
                <CreateWorkspaceFormNetworkAddressFields
                    index={index}
                    listName={name}
                />
            </div>
            {/* biome-ignore lint/plugin/noPrimitiveSpacing: aligns the menu button with the field below the label from md */}
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
