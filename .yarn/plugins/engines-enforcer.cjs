'use strict';

module.exports = {
  name: 'engines-enforcer',
  factory(require) {
    const { MessageName } = require('@yarnpkg/core');

    const parseVersion = (version) => {
      const [major = '0', minor = '0', patch = '0'] = version.split('.');
      return [Number(major), Number(minor), Number(patch)];
    };

    const compareVersions = (a, b) => {
      const [amaj, amin, apat] = parseVersion(a);
      const [bmaj, bmin, bpat] = parseVersion(b);
      if (amaj !== bmaj) return amaj < bmaj ? -1 : 1;
      if (amin !== bmin) return amin < bmin ? -1 : 1;
      if (apat !== bpat) return apat < bpat ? -1 : 1;
      return 0;
    };

    const satisfies = (current, range) => {
      if (typeof range !== 'string' || range.trim() === '') return true;
      const trimmed = range.trim();

      // Support common patterns used: 
      // - ">=x.y.z" or ">=x"
      if (trimmed.startsWith('>=')) {
        const min = trimmed.replace(/^>=\s*/, '').replace(/^v/, '');
        return compareVersions(current, min) >= 0;
      }

      // Exact version (e.g., "22.0.0")
      if (/^\d+\.\d+\.\d+$/.test(trimmed)) {
        return compareVersions(current, trimmed) === 0;
      }

      // Fallback to permissive if unknown format
      return true;
    };

    const extractSuggestedVersion = (range) => {
      if (typeof range !== 'string') return null;
      const match = range.match(/(\d+)(?:\.\d+)?(?:\.\d+)?/);
      return match ? match[1] : null;
    };

    return {
      hooks: {
        async validateProject(project, report) {
          try {
            const manifest = project.topLevelWorkspace.manifest;
            const engines = (manifest.raw && manifest.raw.engines) || manifest.engines;
            const required = engines && engines.node;
            if (!required) return;

            const current = process.versions.node;
            if (!satisfies(current, required)) {
              const suggestedMajor = extractSuggestedVersion(required);
              report.reportError(
                MessageName.UNSUPPORTED_ENGINE,
                `Unsupported Node.js version ${current}. Required by engines.node: "${required}".\n` +
                `Tip: this repository contains an .nvmrc file. If you use nvm, run:\n` +
                `  nvm use\n` +
                `If nvm isn't set up with Node ${suggestedMajor}, run:\n` +
                `  nvm install ${suggestedMajor} && nvm use`
              );
            }
          } catch (_) {
            // ignore
          }
        },
      },
    };
  },
};


