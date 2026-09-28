# Testing

Testing is a crucial part of the Aragon app development as it ensures that the application behaves as expected, catches
bugs early in the development cycle, and provides confidence when making changes in the codebase.

Below are the testing strategies used across the application.

## Unit Tests

Unit testing involves testing individual units of code, typically functions or components, in isolation from the rest of
the application.

### What a test may assert

A test asserts the behaviour of the **directly paired code subject** — its states and its input/output.
Render whatever the subject needs, including third-party components, but never assert what a dependency
does. Such an assertion breaks whenever the dependency changes while guarding nothing of your own.

The failure is concrete. `advancedDateInputDuration.test.tsx` once asserted
`expect(minutesInput).toHaveValue('6 min')` — that string is `@aragon/gov-ui-kit` `InputNumber` masking a
keystroke, not anything the app component does. A kit upgrade changed the masking and broke the test,
while the component's own logic had no coverage at all.

Assert at the subject's output boundary instead:

- **Callback props** — pass `jest.fn()` and assert `toHaveBeenCalledWith`.
- **Form components** — own the form in the test (`useForm` + `FormProvider`), then read
  `form.getValues(field)` and `form.getFieldState(field).error`.

Finally, prove the assertion can fail: break the matching line in the subject, confirm exactly that test
fails, then revert. Derive expectations from the contract — a prop's JSDoc, a util's spec — never by
copying a failure's `Received:` value into the expectation.

### How a test may select

`getByRole`, `getByLabelText` and `getByText` are all fine. Never use a `data-testid`, a CSS or class
selector, or DOM traversal (`parentElement`, next/sibling hops) to reach a node you cannot target
directly.

This is a design rule, not a style preference: a node that cannot be targeted on its own terms means the
composition is too dense, so the fix is to
[split the component](../codingGuidelines/codingGuidelines.md#react-components), never to add a handle.

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
