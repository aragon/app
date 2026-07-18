import { KeyboardShortcut } from '@aragon/gov-ui-kit';

export const Default = () => (
    <div className="flex">
        <KeyboardShortcut>/</KeyboardShortcut>
    </div>
);

export const Combination = () => (
    <div className="flex items-center gap-1">
        <KeyboardShortcut>⌘</KeyboardShortcut>
        <KeyboardShortcut>K</KeyboardShortcut>
    </div>
);

export const InSearchHint = () => (
    <div className="flex items-center gap-2 rounded-xl border border-neutral-100 bg-neutral-0 px-4 py-2">
        <span className="text-neutral-400 text-sm">Search DAOs, proposals, members…</span>
        <KeyboardShortcut>/</KeyboardShortcut>
    </div>
);
