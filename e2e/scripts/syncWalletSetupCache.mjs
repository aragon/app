/**
 * Copies the Synpress-generated wallet cache (hex-named dir) to a stable
 * `wallet-setup` directory name that matches the hash exported from wallet.setup.ts.
 * Also patches the MetaMask manifest to disable Side Panel (not accessible to Playwright).
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const CACHE_ROOT = path.join(process.cwd(), '.cache-synpress');
/** Must match the `hash` exported from e2e/setup/wallet.setup.ts */
const TARGET_DIR_NAME = 'wallet-setup';
const SETUP_HASH_DIR = /^[a-f0-9]{20}$/;

/** Remove Side Panel entries from MetaMask manifest so it falls back to notification.html popups. */
async function patchMetaMaskManifest() {
    const extGlob = 'metamask-chrome-';
    const entries = await fs.readdir(CACHE_ROOT).catch(() => []);
    const extDir = entries.find((e) => e.startsWith(extGlob));
    if (!extDir) {
        return;
    }

    const manifestPath = path.join(CACHE_ROOT, extDir, 'manifest.json');
    let raw;
    try {
        raw = await fs.readFile(manifestPath, 'utf-8');
    } catch {
        return;
    }

    const manifest = JSON.parse(raw);
    let patched = false;

    if (manifest.side_panel) {
        delete manifest.side_panel;
        patched = true;
    }
    if (Array.isArray(manifest.permissions)) {
        const idx = manifest.permissions.indexOf('sidePanel');
        if (idx !== -1) {
            manifest.permissions.splice(idx, 1);
            patched = true;
        }
    }

    if (patched) {
        await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
        console.log(
            '[syncWalletSetupCache] Patched MetaMask manifest: disabled Side Panel',
        );
    }
}

async function main() {
    await patchMetaMaskManifest();

    let entries;
    try {
        entries = await fs.readdir(CACHE_ROOT, { withFileTypes: true });
    } catch (e) {
        console.error(`[syncWalletSetupCache] Cannot read ${CACHE_ROOT}:`, e);
        process.exit(1);
    }

    const hashDirs = [];
    for (const ent of entries) {
        if (!ent.isDirectory() || ent.name === TARGET_DIR_NAME) {
            continue;
        }
        if (!SETUP_HASH_DIR.test(ent.name)) {
            continue;
        }
        const full = path.join(CACHE_ROOT, ent.name);
        const st = await fs.stat(full);
        hashDirs.push({ name: ent.name, full, mtimeMs: st.mtimeMs });
    }

    if (hashDirs.length === 0) {
        console.error(
            `[syncWalletSetupCache] No synpress wallet cache (20-char hex dir) under ${CACHE_ROOT}. Run synpress first.`,
        );
        process.exit(1);
    }

    hashDirs.sort((a, b) => b.mtimeMs - a.mtimeMs);
    const src = hashDirs[0].full;
    const dest = path.join(CACHE_ROOT, TARGET_DIR_NAME);

    await fs.rm(dest, { recursive: true, force: true });
    await fs.cp(src, dest, { recursive: true });
    console.log(
        `[syncWalletSetupCache] ${hashDirs[0].name} -> ${TARGET_DIR_NAME}`,
    );
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
