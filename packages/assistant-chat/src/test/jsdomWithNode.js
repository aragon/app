const JsdomEnvironmentModule = require('jest-environment-jsdom');

const JsdomEnvironment =
    JsdomEnvironmentModule.TestEnvironment ??
    JsdomEnvironmentModule.default ??
    JsdomEnvironmentModule;

// WHATWG globals that jsdom leaves undefined but assistant-stream and the AI SDK reference at
// module load (Response) or use for SSE parsing and message snapshots. Node already ships all of
// them, so we borrow Node's own implementations instead of adding a polyfill dependency.
// Deliberately NOT MessageChannel/MessagePort: React 19's scheduler would grab Node's version and
// keep an open handle, so jest never exits — jsdom's absence makes React fall back to setTimeout.
const nodeGlobals = [
    'fetch',
    'Response',
    'Request',
    'Headers',
    'FormData',
    'structuredClone',
    'ReadableStream',
    'WritableStream',
    'TransformStream',
    'TextDecoderStream',
    'TextEncoder',
    'TextDecoder',
];

// jsdom test environment augmented with Node's built-in WHATWG globals. The constructor runs in the
// Node worker context, so `globalThis` here is Node's (which has these) while `this.global` is the
// jsdom realm the tests run in.
class JsdomWithNodeEnvironment extends JsdomEnvironment {
    constructor(config, context) {
        super(config, context);

        for (const name of nodeGlobals) {
            if (
                this.global[name] === undefined &&
                globalThis[name] !== undefined
            ) {
                this.global[name] = globalThis[name];
            }
        }
    }
}

module.exports = JsdomWithNodeEnvironment;
