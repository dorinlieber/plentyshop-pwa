import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { NormalizedOutputOptions, OutputBundle } from 'rollup';

export const FailOnLargeChunksPlugin = {
  name: 'fail-on-large-chunks',
  generateBundle(_: NormalizedOutputOptions, bundle: OutputBundle) {
    if (!process.env.FAIL_BUILD_ON_LARGE_CHUNKS) {
      console.warn('Skipping chunk size check as FAIL_BUILD_ON_LARGE_CHUNKS is not set.');
      return;
    }
    // Increased to 630 KB to accommodate the CodeMirror bundle which is now automatically code-split via auto-imports instead of being manually chunked.
    const LIMIT = 630 * 1024; // 630 KB
    for (const [fileName, chunk] of Object.entries(bundle)) {
      if (fileName === 'server.mjs') continue; // skip server bundle
      if (chunk.type === 'chunk' && chunk.code.length > LIMIT) {
        throw new Error(
          `❌ Chunk "${fileName}" is too large (${(chunk.code.length / 1024).toFixed(2)} KB). ` +
            `Limit is ${LIMIT / 1024} KB.`,
        );
      }
    }
  },
};

export const FailOnForbiddenDataInPublicFolderPlugin = {
  name: 'fail-on-forbidden-data-in-public-folder',
  generateBundle() {
    if (!process.env.FAIL_BUILD_ON_FORBIDDEN_DATA_IN_PUBLIC_FOLDER) {
      console.warn(
        'Skipping public/ folder entries check as FAIL_BUILD_ON_FORBIDDEN_DATA_IN_PUBLIC_FOLDER is not set.',
      );
      return;
    }
    const publicDir = resolve(__dirname, '../../public');
    if (!existsSync(publicDir)) return;
    const unexpected = readdirSync(publicDir).filter((e) => e !== '_nuxt-plenty');
    if (unexpected.length > 0) {
      throw new Error(
        `❌ Unexpected entries in "public/": ${unexpected.join(', ')}. ` +
          `Due to routing rules, only the "_nuxt-plenty/" subdirectory is allowed in the public directory. Please move any public assets to the appropriate location.`,
      );
    }
  },
};

/*
 * Dorins: Vite 8 behält den Dateinamen eines JS-Chunks bei, wenn sich nur der Name einer darin genannten
 * CSS-Datei ändert. Browser halten /_nuxt/ ein Jahr lang („immutable“) und laden dann über den alten Chunk
 * das alte CSS nach (27.10.2026 im Testshop gesehen). Eine Kennung je Build im Namen erzwingt den neuen Stand.
 */
const buildId = Date.now().toString(36);

export const ChunkNamesPerBuildPlugin = {
  name: 'dorins-chunk-names-per-build',
  apply: 'build' as const,
  enforce: 'post' as const,
  configEnvironment(name: string) {
    if (name !== 'client') return;
    const fileNames = `_nuxt/[hash]-${buildId}.js`;
    return { build: { rolldownOptions: { output: { chunkFileNames: fileNames, entryFileNames: fileNames } } } };
  },
};
