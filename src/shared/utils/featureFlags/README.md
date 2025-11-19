# Feature Flags System

A feature flag system that allows controlling feature visibility across different environments without code changes.

## Overview

The feature flags system supports three levels of configuration:

1. **Code defaults** - Defined in `featureFlags.config.ts`
2. **CMS overrides** - Managed via GitHub CMS (`feature-flags.json`)
3. **Local overrides** - Set via browser cookies (for debugging)

The final value is resolved in this priority order:

```
Local override (cookie) > CMS override > Environment-specific (code) > Default (code)
```

## Usage

### Server-side

```typescript
import { featureFlags } from '@/shared/utils/featureFlags';

// Check if a feature is enabled
const isSubDaoEnabled = await featureFlags.isEnabled('subDao');

// Get all flags snapshot
const snapshot = await featureFlags.getSnapshot();
```

### Client-side

```typescript
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';

function MyComponent() {
  const { isEnabled } = useFeatureFlags();

  if (isEnabled('subDao')) {
    return <SubDaoFeature />;
  }

  return null;
}
```

## Adding a New Feature Flag

### 1. Define the flag in code

Add the flag definition to `featureFlags.config.ts`:

```typescript
export const FEATURE_FLAG_DEFINITIONS: FeatureFlagDefinition[] = [
    // ... existing flags
    {
        key: 'myNewFeature',
        name: 'My New Feature',
        description: 'Enables my new feature.',
        defaultValue: false,
        environments: {
            local: true,
            preview: true,
            production: false,
        },
    },
];
```

### 2. Add the key to the type

Update `FeatureFlagKey` in `featureFlags.api.ts`:

```typescript
export type FeatureFlagKey = 'debugPanel' | 'subDao' | 'myNewFeature';
```

### 3. (Optional) Add CMS override

Add the flag to `app-cms/feature-flags.json` if you want to override defaults:

```json
{
    "myNewFeature": {
        "local": true,
        "preview": true,
        "production": false
    }
}
```

## CMS Configuration

Feature flags can be overridden via the GitHub CMS repository (`app-cms`).

### File Location

The CMS file is located at:

- **Repository**: `aragon/app-cms`
- **File**: `feature-flags.json`
- **URL**: `https://github.com/aragon/app-cms/blob/main/feature-flags.json`

### Format Options

#### 1. Simple format (same value for all environments)

```json
{
    "subDao": true
}
```

#### 2. Environment-specific format

```json
{
    "subDao": {
        "development": true,
        "local": true,
        "preview": false,
        "production": false,
        "staging": false
    }
}
```

#### 3. Mixed format

```json
{
    "debugPanel": true,
    "subDao": {
        "local": true,
        "preview": false,
        "production": false
    }
}
```

### Supported Environments

- `local` - Local development
- `preview` - Preview deployments
- `development` - Development environment
- `staging` - Staging environment
- `production` - Production environment

## Local Overrides (Debugging)

For local debugging, you can override flags using browser cookies.

### Setting an override

The cookie name is: `aragon.featureFlags.overrides`

Example cookie value:

```
aragon.featureFlags.overrides=%7B%22subDao%22%3Atrue%7D
```

Which decodes to:

```json
{ "subDao": true }
```

### Using the Debug Panel

If the debug panel is enabled, you can toggle feature flags directly in the UI without manually setting cookies.

## GitHub CMS Provider

The `GithubCmsFeatureFlagsProvider` loads feature flag overrides from the GitHub CMS repository.

### How it works

1. Fetches `feature-flags.json` from the GitHub CMS repository
2. Parses the JSON response
3. Extracts the value for the current environment
4. Merges with cookie-based local overrides
5. Returns the final overrides object

### Implementation

```typescript
export class GithubCmsFeatureFlagsProvider implements IFeatureFlagsProvider {
    loadOverrides = async (): Promise<FeatureFlagOverrides> => {
        // 1. Load CMS overrides
        const cmsOverrides = await loadCmsOverrides(this.environment);

        // 2. Load cookie overrides
        const localOverrides = parseFeatureFlagOverridesFromCookie(cookieSource);

        // 3. Merge (local overrides take precedence)
        return { ...cmsOverrides, ...localOverrides };
    };
}
```

### Error Handling

- If CMS fetch fails, the system falls back to code defaults
- Invalid JSON or missing keys are ignored
- The system is designed to be resilient

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Feature Flags                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Code Defaults│  │ CMS Overrides │  │ Local Cookie │ │
│  │ (config.ts)  │  │ (GitHub CMS)  │  │  Overrides   │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Resolution      │                    │
│                  │  (Priority)     │                    │
│                  └────────┬────────┘                    │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Final Value    │                    │
│                  └─────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

## Files Structure

```
featureFlags/
├── README.md                    # This file
├── index.ts                     # Public exports
├── featureFlags.api.ts          # Type definitions
├── featureFlags.config.ts        # Flag definitions
├── featureFlags.ts              # Main service class
├── featureFlags.cookies.ts      # Cookie parsing/serialization
└── featureFlags.githubProvider.ts # GitHub CMS provider
```

## Examples

### Example 1: Conditional Rendering

```typescript
import { useFeatureFlags } from '@/shared/components/featureFlagsProvider';

function Dashboard() {
  const { isEnabled } = useFeatureFlags();

  return (
    <div>
      <MainContent />
      {isEnabled('subDao') && <SubDaoSection />}
    </div>
  );
}
```

### Example 2: Server-side Feature Gate

```typescript
import { featureFlags } from '@/shared/utils/featureFlags';

export async function getServerSideProps() {
    const isSubDaoEnabled = await featureFlags.isEnabled('subDao');

    if (!isSubDaoEnabled) {
        return { notFound: true };
    }

    return { props: {} };
}
```

### Example 3: Environment-specific Behavior

```typescript
// In featureFlags.config.ts
{
  key: 'experimentalFeature',
  defaultValue: false,
  environments: {
    local: true,        // Enabled in local dev
    preview: true,      // Enabled in preview
    production: false,   // Disabled in production
  },
}
```

## Best Practices

1. **Always define defaults in code** - Don't rely solely on CMS
2. **Use descriptive names** - Flag keys should be self-explanatory
3. **Document flag purpose** - Include clear descriptions
4. **Test with flags disabled** - Ensure features work when flags are off
5. **Remove flags when done** - Clean up flags for features that are fully released
6. **Use environment-specific values** - Prefer environment configs over simple booleans when possible

## Troubleshooting

### Flag not working?

1. Check if the flag is defined in `featureFlags.config.ts`
2. Verify the key is added to `FeatureFlagKey` type
3. Check CMS file format and environment values
4. Clear browser cookies if using local overrides
5. Verify the environment is correctly detected

### CMS not loading?

1. Check network connectivity
2. Verify GitHub repository is accessible
3. Check file path: `/main/feature-flags.json`
4. Verify JSON syntax is valid
5. System will fall back to code defaults on error
