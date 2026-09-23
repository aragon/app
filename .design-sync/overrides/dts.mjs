import * as base from '../../.ds-sync/lib/dts.mjs';
import {
    appOwnership,
    appPropsBody,
    compoundMembers,
    owns,
} from './app-ownership.mjs';

// Keep the official type extractor for GovKit. App exports use the same
// ts-morph-backed propsBodyFor algorithm, but against app-entry.ts and app/src.
export * from '../../.ds-sync/lib/dts.mjs';

export function loadDts(typesRoot) {
    const result = base.loadDts(typesRoot);
    for (const name of appOwnership().owned.keys()) {
        const members = compoundMembers(name);
        if (members.length) {
            result.compounds.set(
                name,
                members.map(({ member }) => member),
            );
        }
    }
    return result;
}

export function propsBodyFor(name, ctx) {
    if (!owns(name)) {
        return base.propsBodyFor(name, ctx);
    }

    const props = appPropsBody(name);
    if (props) {
        return props;
    }

    throw new Error(
        `[app-dts] no source props contract for App export ${name}`,
    );
}
