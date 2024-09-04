import { DialogAlertRoot } from '@aragon/ods';
import { render, screen } from '@testing-library/react';
import { DialogAlertRootHiddenElement, type IDialogAlertRootHiddenElementProps } from './dialogAlertRootHiddenElement';

describe('<DialogRootHiddenElement /> component', () => {
    const createTestComponent = (props?: Partial<IDialogAlertRootHiddenElementProps>) => {
        const completeProps: IDialogAlertRootHiddenElementProps = {
            type: 'title',
            ...props,
        };

        return (
            <DialogAlertRoot open={true}>
                <DialogAlertRootHiddenElement {...completeProps} />
            </DialogAlertRoot>
        );
    };

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
