// Tests for the Claude adapter shape over the shared guardrails loader.
//
// Cleanup model: every test that touches the file system uses mkdtempSync
// against os.tmpdir() (a unique dir per call, outside the repo) and removes
// it in afterEach. The pre-test sweep below defensively reaps any leftover
// inject-rules-test-* dirs from a prior crashed run so /tmp doesn't bloat.
// No test writes to the repo working tree, so `git status` stays clean.

import { strict as assert } from 'node:assert/strict'
import { buildAdditionalContext } from '../../.agents/hooks/inject-rules.mjs'
import {
    registerGuardrailsContractSuite,
    registerTmpCleanup,
} from '../../.agents/hooks/inject-rules.test-helpers.mjs'

registerTmpCleanup()

registerGuardrailsContractSuite({
    suiteName: 'buildAdditionalContext Claude contract',
    buildResult: buildAdditionalContext,
    assertHitOutput: (output, { ruleName, ruleBody }) => {
        assert.equal(output.hookSpecificOutput.hookEventName, 'PreToolUse')
        assert.match(
            output.hookSpecificOutput.additionalContext,
            new RegExp(ruleBody),
        )
        assert.match(
            output.hookSpecificOutput.additionalContext,
            new RegExp(`<rule-skill name="${ruleName}"`),
        )
    },
})
