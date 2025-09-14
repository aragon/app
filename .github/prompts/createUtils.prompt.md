---
mode: 'agent'
model: GPT-4o
tools: ['codebase']
description: 'Generate a new utils file with proper architecture and testing'
---

Your goal is to generate a new TypeScript utils file following the Aragon application's architecture patterns and coding standards.

## Naming Conventions
* **File name**: Use camelCase, same as the main component file name, plus `Utils` at the end (e.g., `daoListUtils.ts`)
* **Class name**: Use PascalCase matching the file name (e.g., `DaoListUtils`)
* **Instance export**: Use camelCase matching the file name (e.g., `export const daoListUtils = new DaoListUtils()`)
* **If specific name is provided, use it as the first option**

## File Location Strategy
* **Shared/general utils**: Place in `/src/shared/utils/[utilName]/` directory
* **Module-specific utils**: Place in `/src/modules/[module]/utils/[utilName]/` directory (e.g., `/src/modules/governance/utils/createProposalUtils/`)
* **Component-specific utils**: Place in the same directory as the component (e.g., `/src/modules/governance/dialogs/voteDialog/voteDialogUtils.ts`)

## Architecture Requirements

### Class-Based Pattern
Utils must be defined as ES6 classes with a single exported instance:
```typescript
class MyComponentUtils {
    // Methods using arrow functions for proper 'this' binding
    methodName = (params: Type): ReturnType => {
        // Implementation
    };
    
    // Private methods should be marked private
    private helperMethod = (params: Type): ReturnType => {
        // Implementation
    };
}

export const myComponentUtils = new MyComponentUtils();
```

### Code Style Requirements
* Use **arrow functions** for all class methods to ensure proper `this` binding
* Mark private methods with `private` keyword
* Follow camelCase for method names
* Use TypeScript interfaces for complex parameter objects
* Prefer optional fields (`field?: string`) over unions with null/undefined
* Add JSDoc comments for public methods when logic is complex

### Import Strategy
* Use path aliases (`@/modules`, `@/shared`, `@/plugins`) for cross-directory imports
* Use relative paths for imports within the same module
* Import from `@aragon/gov-ui-kit` for UI utilities (addressUtils, etc.)
* Import types using `type` keyword: `import type { IType } from 'module'`

## Examples to Follow

### Shared Utils Example
Reference: [addressesListUtils](../../src/shared/utils/addressesListUtils/addressesListUtils.ts)
* Place in `/src/shared/utils/[utilName]/` directory with index.ts export
* Include comprehensive validation and helper methods
* Use translation namespaces for error messages (e.g., `app.shared.addressesInput.item.input.error`)

### Module-Specific Utils Example
Reference: [createProposalUtils](../../src/modules/governance/utils/createProposalUtils/createProposalUtils.ts)
* Place in `/src/modules/[module]/utils/[utilName]/` directory structure
* Create separate `.api.ts` file for TypeScript interfaces and types
* Include private constants and helper methods
* Use invariant assertions for input validation
* Handle date/time operations with proper parsing and conversion
* Include comprehensive JSDoc comments for complex methods

### Component Utils Example  
Reference: [walletConnectActionDialogUtils](../../src/modules/governance/dialogs/walletConnectActionDialog/walletConnectActionDialogUtils.tsx)
* Place alongside the component in same directory
* Export TypeScript interfaces for complex parameter objects
* Include async methods when dealing with external APIs or blockchain interactions
* Handle errors gracefully and return meaningful fallbacks

## Testing Requirements

### Always create unit tests unless explicitly told not to
* Test file name: `[utilName].test.tsx` (note: use .tsx extension even for utils)
* Place test file in the same directory as the utils file
* Use Jest with React Testing Library patterns
* Mock external dependencies (addressUtils, API calls, etc.)
* Test both success and error cases
* Use descriptive test names that explain the behavior being tested

### Test Structure Pattern
```typescript
import { utilsInstance } from './utilsFile';

describe('Utils Class Name', () => {
    // Mock setup
    const mockFn = jest.spyOn(dependency, 'method');
    
    afterEach(() => {
        mockFn.mockReset();
    });

    describe('methodName', () => {
        it('should describe expected behavior when condition', () => {
            // Arrange
            mockFn.mockReturnValue(expectedValue);
            
            // Act
            const result = utilsInstance.methodName(params);
            
            // Assert
            expect(result).toBe(expectedValue);
            expect(mockFn).toHaveBeenCalledWith(expectedParams);
        });
    });
});
```

## Plugin-Specific Considerations
If creating utils for plugins, follow the plugin naming convention:
* Prefix with plugin name: `tokenMemberUtils`, `multisigActionUtils`
* Place in appropriate plugin directory: `/src/plugins/[pluginName]/utils/`
* Export interfaces with plugin-specific prefixes when needed

## Additional Notes
* Ensure utils are pure functions when possible (no side effects)
* For blockchain-related utils, handle BigInt conversions properly using viem utilities
* Include proper error handling with meaningful error messages
* Use translation keys for user-facing messages following the pattern: `app.[module].[component].[key]`