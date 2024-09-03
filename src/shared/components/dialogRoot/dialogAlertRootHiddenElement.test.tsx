import { DialogRoot } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DialogAlertRootHiddenElement, type IDialogAlertRootHiddenElementProps } from './dialogAlertRootHiddenElement';

describe('<DialogRootHiddenElement /> component', () => {
    const createTestComponent = (props?: Partial<IDialogAlertRootHiddenElementProps>) => {
        const completeProps: IDialogAlertRootHiddenElementProps = {
            type: 'title',
            ...props,
        };

        return (
            <DialogRoot open={true}>
                <DialogAlertRootHiddenElement {...completeProps} />
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
