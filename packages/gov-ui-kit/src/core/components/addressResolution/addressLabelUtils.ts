import { addressUtils } from '../../utils';

/**
 * Separates the workspace name from the label in the text form of a name from another workspace. It is not allowed in
 * any name, so a `›` in that text form always comes from the kit.
 */
export const ADDRESS_TEXT_SEPARATOR = '›';

/**
 * Where an address name comes from. The order of the tiers (see `ADDRESS_SOURCE_TIERS`) decides which one is shown.
 */
export type AddressSource = 'workspace' | 'other-workspace' | 'known-account' | 'ens';

/**
 * Tiers in order of preference: your own names, then the current workspace's accounts, then other workspaces, then ENS.
 */
export const ADDRESS_SOURCE_TIERS: readonly AddressSource[] = ['workspace', 'known-account', 'other-workspace', 'ens'];

export interface IAddressEntry {
    /**
     * Name of the address. An entry without a label is ignored.
     */
    label: string;
    source: AddressSource;
    /**
     * Name of the workspace, only for the `other-workspace` source. Untrusted text.
     */
    sourceLabel?: string;
    /**
     * Display name of the network, only for a name saved for one network. Text of the app.
     */
    networkLabel?: string;
}

/**
 * The only codes `useResolveAddress` returns.
 */
export type AddressWarning =
    /** The label starts with `0x`. It is shown with a warning. */
    | 'looks-like-address'
    /** The label is not shown because it is unsafe or an address in disguise. */
    | 'invalid-label'
    /** A name that is not yours is the same as one of yours, for a different address. */
    | 'same-name-as-yours';

export type AddressNameError =
    | 'empty'
    | 'too-long'
    | 'invalid-characters'
    | 'extra-spaces'
    | 'contains-separator'
    | 'looks-like-address'
    | 'looks-like-ens'
    | 'confusing-word';

export type AddressNameResult =
    | { ok: true; warnings: Extract<AddressWarning, 'looks-like-address'>[] }
    | { ok: false; reason: AddressNameError };

export type AddressLikeKind = 'address' | 'prefix';

const MAX_SAFE_LENGTH = 64;
const MAX_NAME_LENGTH = 40;
const MAX_SOURCE_LABEL_LENGTH = 12;
const CONFUSING_WORDS = new Set(['official', 'verified', 'authentic', 'audited', 'trusted', 'legit']);

const codePointLength = (text: string) => Array.from(text).length;

// Control and format characters (bidi and zero-width included), line and paragraph separators, surrogates that are
// alone, and every space other than U+0020 (U+2800, the blank braille pattern, looks like a space too).
const unsafeCharacters = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}\p{Cs}\u2800]|[^\S ]/u;
const manyCombiningMarks = /\p{M}{4,}/u;

// Unicode normalisation (NFKC turns full-width `０ｘ` into `0x`), then lowercase.
const toStandardForm = (text: string) => text.normalize('NFKC').toLowerCase();

// The form used to compare names: standard form with no space at the ends and single spaces inside.
const toComparableName = (text: string) => toStandardForm(text).trim().replace(/\s+/gu, ' ');

/**
 * Key of an address in the entries of the provider. Network `0` means all networks.
 */
export const addressEntryKey = (address: string, chainId: number) => `${address.toLowerCase()}:${chainId}`;

/**
 * The one rule that tells whether a name looks like an address, shared by the form, the provider and the app.
 * - `address`: after removing every character that is not a letter or a digit, it contains `0x` and 6 or more hex digits.
 * - `prefix`: it only starts with `0x` (`0xDAO`).
 */
export const classifyAddressLike = (text: string): AddressLikeKind | null => {
    const standard = toStandardForm(text);

    if (/0x[0-9a-f]{6,}/.test(standard.replace(/[^\p{L}\p{N}]/gu, ''))) {
        return 'address';
    }

    return standard.trim().startsWith('0x') ? 'prefix' : null;
};

const getUnsafeReason = (text: string): 'empty' | 'too-long' | 'contains-separator' | 'invalid-characters' | null => {
    if (text.trim().length === 0) {
        return 'empty';
    }

    if (text.includes(ADDRESS_TEXT_SEPARATOR)) {
        return 'contains-separator';
    }

    if (unsafeCharacters.test(text) || manyCombiningMarks.test(text)) {
        return 'invalid-characters';
    }

    return codePointLength(text) > MAX_SAFE_LENGTH ? 'too-long' : null;
};

/**
 * Whether a text can be shown as a name: not empty, at most 64 code points, with no hidden, control or look-alike
 * space character, no stack of combining marks and no `›`.
 */
export const isSafeToDisplay = (text: string) => getUnsafeReason(text) == null;

/**
 * Checks an entry, whatever its source. Returns `ok: false` for an entry that must not be shown, or the warnings of one
 * that can be. The `same-name-as-yours` check needs the other entries, so the provider adds it.
 */
export const checkLabel = (
    entry: Pick<IAddressEntry, 'label' | 'sourceLabel' | 'networkLabel' | 'source'>,
): { ok: true; warnings: Extract<AddressWarning, 'looks-like-address'>[] } | { ok: false } => {
    const texts = [entry.label, entry.sourceLabel, entry.networkLabel].filter((text) => text != null);
    const kind = classifyAddressLike(entry.label);

    if (!texts.every(isSafeToDisplay) || kind === 'address') {
        return { ok: false };
    }

    return { ok: true, warnings: kind === 'prefix' ? ['looks-like-address'] : [] };
};

/**
 * Cuts the name of a workspace at 12 code points, with an ellipsis.
 */
export const truncateSourceLabel = (text: string) => {
    const characters = Array.from(text);

    return characters.length > MAX_SOURCE_LABEL_LENGTH
        ? `${characters.slice(0, MAX_SOURCE_LABEL_LENGTH).join('')}…`
        : text;
};

/**
 * The text form of a name, for places that cannot draw a chip: the label alone, or `<workspace> › <label>` for a name
 * from another workspace.
 */
export const formatAddressText = (entry: Pick<IAddressEntry, 'label' | 'source' | 'sourceLabel'>) =>
    entry.source === 'other-workspace' && entry.sourceLabel != null
        ? `${truncateSourceLabel(entry.sourceLabel)} ${ADDRESS_TEXT_SEPARATOR} ${entry.label}`
        : entry.label;

/**
 * The truncated address, or the value as is when it is not an address.
 */
export const formatShortAddress = (value = '') => addressUtils.truncateHash(addressUtils.truncateAddress(value));

const looksLikeEns = (text: string) => {
    if (/\s/u.test(text)) {
        return false;
    }

    const parts = text.split(/[.。．｡]/u);
    const last = parts.at(-1) ?? '';

    return (
        parts.length >= 2 && parts.every((part) => part.length > 0) && codePointLength(last) >= 2 && /\p{L}/u.test(last)
    );
};

const hasConfusingWord = (text: string) =>
    toStandardForm(text)
        .split(/[^\p{L}\p{N}]+/u)
        .some((word) => CONFUSING_WORDS.has(word));

/**
 * Checks a name typed by a user, or read back from storage, before it is saved.
 */
export const validateName = (text: string): AddressNameResult => {
    const unsafe = getUnsafeReason(text);

    if (unsafe != null && unsafe !== 'too-long') {
        return { ok: false, reason: unsafe };
    }

    if (text !== text.trim() || text.includes('  ')) {
        return { ok: false, reason: 'extra-spaces' };
    }

    if (codePointLength(text) > MAX_NAME_LENGTH) {
        return { ok: false, reason: 'too-long' };
    }

    const kind = classifyAddressLike(text);

    if (kind === 'address') {
        return { ok: false, reason: 'looks-like-address' };
    }

    if (looksLikeEns(text)) {
        return { ok: false, reason: 'looks-like-ens' };
    }

    if (hasConfusingWord(text)) {
        return { ok: false, reason: 'confusing-word' };
    }

    return { ok: true, warnings: kind === 'prefix' ? ['looks-like-address'] : [] };
};

/**
 * The form of a name used to compare it with other names.
 */
export const normalizeName = toComparableName;
