import { useTranslations } from '@/shared/components/translationsProvider';
import { useFormField } from '@/shared/hooks/useFormField';
import { Button, Card, Dropdown, IconType, InputText } from '@aragon/ods';

export interface IResourceItemProps {
    /**
     * The index of the resource item in the list.
     */
    index: number;
    /**
     * Callback to remove the resource item.
     */
    remove: (index: number) => void;
}

export const ResourceItem: React.FC<IResourceItemProps> = ({ index, remove }) => {
    const { t } = useTranslations();

    const labelField = useFormField(`resources.${index}.label`, {
        label: t('app.createProposal.createProposalForm.resources.labelInput.title'),
        rules: { required: true },
        defaultValue: '',
    });

    const linkField = useFormField(`resources.${index}.link`, {
        label: t('app.createProposal.createProposalForm.resources.linkInput.title'),
        defaultValue: '',
        rules: {
            required: true,
            pattern: {
                value: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                message: 'Invalid URL format',
            },
        },
    });

    return (
        <Card className="flex flex-col gap-3 border border-neutral-100 p-6 shadow-neutral-sm md:flex-row md:gap-2">
            <InputText
                placeholder={t('app.createProposal.createProposalForm.resources.labelInput.placeholder')}
                {...labelField}
            />
            <InputText
                placeholder={t('app.createProposal.createProposalForm.resources.linkInput.placeholder')}
                {...linkField}
            />
            <div className="mt-9">
                <Dropdown.Container
                    constrainContentWidth={false}
                    size="md"
                    customTrigger={<Button variant="tertiary" size="lg" iconLeft={IconType.DOTS_VERTICAL} />}
                >
                    <Dropdown.Item onClick={() => remove(index)}>
                        {t('app.createProposal.createProposalForm.resources.removeResource')}
                    </Dropdown.Item>
                </Dropdown.Container>
            </div>
        </Card>
    );
};
