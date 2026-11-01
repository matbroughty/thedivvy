import {readFile,writeFile} from 'node:fs/promises';
import {digest} from './lib.mjs';
const load=async p=>JSON.parse(await readFile(p,'utf8'));
await writeFile('output/render-receipt.json',JSON.stringify({timelineHash:digest(await load('src/timeline.json')),configHash:digest(await load('scenes.json')),scriptHash:digest(await readFile('narration.md','utf8'))},null,2));
