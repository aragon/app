# Testing

Testing is a crucial part of the Aragon app development as it ensures that the application behaves as expected, catches
bugs early in the development cycle, and provides confidence when making changes in the codebase.

Below are the testing strategies used across the application.

## Unit Tests

Unit testing involves testing individual units of code, typically functions or components, in isolation from the rest of
the application.

### Writing Tests

#### Components

When testing React components, focus on testing their behavior, including rendering, user interactions, and properties
handling.

Here is an example of a simple unit test of a Client component:

```typescript
// footer.test.tsx

describe('<Footer /> component', () => {
    const createTestComponent = (props?: Partial<IFooterProps>) => {
        const completeProps: IFooterProps = { ...props };

        return <Footer {...completeProps}>;
    };

    it('renders the footer links', async () => {
        render(createServerComponent());
        expect(screen.getAllByRole('link')).toHaveLength(footerLinks.length);
    });
});
```

Server components can be tested in a similar way:

```typescript
// footer.test.tsx

describe('<Footer /> component', () => {
    const createServerComponent = async (props?: Partial<IFooterProps>) => {
        const completeProps: IFooterProps = { ...props };
        const Component = await Footer(completeProps);

        return Component;
    };

    it('renders the footer links', async () => {
        render(await createServerComponent());
        expect(screen.getAllByRole('link')).toHaveLength(footerLinks.length);
    });
});
```

#### Utilities

Writing tests for utilities or functions with Jest is straightforward. Here is an example:

```typescript
// queryClientUtils.client.test.ts

describe('queryClient utils (client)', () => {
    it('getQueryClient returns a query-client instance', () => {
        const client = queryClientUtils.getQueryClient();
        expect(client).toBeDefined();
    });
});
```

Update the Jest environment to use Node and simulate a server environment for testing server-specific logic:

```typescript
// queryClientUtils.server.test.ts

/**
 * @jest-environment node
 */

describe('queryClient utils (server)', () => {
    it('getQueryClient always create a new query-client instance', () => {
        const client = queryClientUtils.getQueryClient();
        const newClient = queryClientUtils.getQueryClient();
        expect(client === newClient).toBeFalsy();
    });
});
```

## Integration Tests

TODO (APP-3137)

## E2E Tests

TODO (APP-3137)
