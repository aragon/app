import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useTranslations } from '../../translationsProvider';

export interface IDialogRootHiddenElementProps {
    /**
     * Key of the label only rendered for screen readers.
     */
    labelKey?: string;
    /**
     * Type of element to be displayed.
     */
    type: 'title' | 'description';
}

export const DialogRootHiddenElement: React.FC<IDialogRootHiddenElementProps> = (props) => {
    const { labelKey, type } = props;
    const { t } = useTranslations();

    if (!labelKey) {
        return null;
    }

    const LabelComponent = type === 'title' ? DialogTitle : DialogDescription;

    return (
        <VisuallyHidden asChild={true}>
            <LabelComponent>{t(labelKey)}</LabelComponent>
        </VisuallyHidden>
    );
};
