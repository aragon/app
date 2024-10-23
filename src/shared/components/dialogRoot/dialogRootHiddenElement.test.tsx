import { DialogRoot } from '@aragon/gov-ui-kit';
import { render, screen } from '@testing-library/react';
import { DialogRootHiddenElement, type IDialogRootHiddenElementProps } from './dialogRootHiddenElement';

describe('<DialogRootHiddenElement /> component', () => {
    const createTestComponent = (props?: Partial<IDialogRootHiddenElementProps>) => {
        const completeProps: IDialogRootHiddenElementProps = {
            type: 'title',
            ...props,
        };

        return (
            <DialogRoot open={true}>
                <DialogRootHiddenElement {...completeProps} />
            </DialogRoot>
        );
    };

    it('renders empty container when label is not defined', () => {
        const { container } = render(createTestComponent({ labelKey: undefined }));
        expect(container).toBeEmptyDOMElement();
    });

    it('renders the specified title', () => {
        const labelKey = 'test-title';
        const type = 'title';
        render(createTestComponent({ labelKey, type }));
        expect(screen.getByText(labelKey)).toBeInTheDocument();
    });

    it('renders the specified description', () => {
        const labelKey = 'test-description';
        const type = 'description';
        render(createTestComponent({ labelKey, type }));
        expect(screen.getByText(labelKey)).toBeInTheDocument();
    });
});
