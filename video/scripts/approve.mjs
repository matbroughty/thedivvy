import {readFile,writeFile} from 'node:fs/promises';
import {digest} from './lib.mjs';
if(!process.argv.includes('--confirm')) throw Error('Run npm run approve -- --confirm only after Mat approves narration.md.');
const text=await readFile('narration.md','utf8');
await writeFile('approval.json',JSON.stringify({hash:digest(text),approvedAt:new Date().toISOString()},null,2));
console.log('Approved this exact narration revision. Changes require approval again.');
