const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const { parse } = require('yaml');

const readWorkflow = (name) =>
    parse(fs.readFileSync(`.github/workflows/${name}.yml`, 'utf8'));

test('release verification includes checks skipped by App Development', () => {
    const developmentTest = readWorkflow('app-development').jobs.test;
    assert.ok(
        developmentTest.if.includes("!startsWith(github.head_ref, 'release/')"),
    );

    for (const workflowName of ['app-release', 'gov-ui-kit-release']) {
        const releaseSteps = readWorkflow(workflowName).jobs.test.steps;
        const stepsByName = new Map(
            releaseSteps.map((step) => [step.name, step]),
        );

        assert.equal(
            stepsByName.get('Check workflow job guards').uses,
            'aragon/github-templates/steps/workflow-guards@v1',
        );
        assert.match(
            stepsByName.get('Check GovKit component registry').run,
            /registry\.mjs check[\s\S]*selection-guide\.mjs check/,
        );
        assert.equal(
            releaseSteps.filter(
                (step) => step.name === 'Check published CSS bundles',
            ).length,
            1,
        );
    }
});
