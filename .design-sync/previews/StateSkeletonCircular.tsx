import { StateSkeletonCircular } from '@aragon/gov-ui-kit';

// Storybook renders every story inside its decorator's flex row. This inline span collapses to
// 0x0 without a flex parent, and cfg.provider can only wrap previews in bundle exports.
export const Default = () => (
    <div className="flex">
        <StateSkeletonCircular />
    </div>
);
