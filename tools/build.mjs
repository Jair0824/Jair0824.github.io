import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolsDirectory, '..');
const output = path.join(projectRoot, '_site');

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(projectRoot, 'index.html'), path.join(output, 'index.html'));
await cp(path.join(projectRoot, 'assets'), path.join(output, 'assets'), { recursive: true });
await cp(path.join(projectRoot, 'content'), path.join(output, 'content'), { recursive: true });
await writeFile(path.join(output, '.nojekyll'), '', 'utf8');
console.log(`Built public site at ${output}`);
