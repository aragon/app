// Vendored from dao-launchpad@f/lido-demo:lido/preview/ui/src — do not edit by hand.
// See infra/lmm-demo/README.md → "Updating vendored libs" for the refresh procedure.
// Adapted: imports rewritten to use the in-tree @/shared/lidoPreview vendoring
// of @aragon/lido-preview, with .ts/.tsx extensions stripped for moduleResolution=bundler.

// Minimal SVG icons. No external icon library — the UI dependency policy
// is "only what's strictly needed", and these are three shapes.

export const InspectIcon = () => (
    <svg
        aria-hidden="true"
        fill="none"
        height="14"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        viewBox="0 0 16 16"
        width="14"
    >
        <circle cx="7" cy="7" r="4.5" />
        <path d="m10.5 10.5 3 3" />
    </svg>
);

export const SimulateIcon = () => (
    <svg
        aria-hidden="true"
        fill="currentColor"
        height="12"
        viewBox="0 0 16 16"
        width="12"
    >
        <path d="M4 2.5v11l9.5-5.5z" />
    </svg>
);

export const StatusIcon = () => (
    <svg
        aria-hidden="true"
        fill="none"
        height="12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
        viewBox="0 0 16 16"
        width="12"
    >
        <path
            d="M2 12h2v2H2zM6 8h2v6H6zM10 4h2v10h-2z"
            fill="currentColor"
            stroke="none"
        />
    </svg>
);

export const CloseIcon = () => (
    <svg
        aria-hidden="true"
        fill="none"
        height="12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
        viewBox="0 0 16 16"
        width="12"
    >
        <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
);
