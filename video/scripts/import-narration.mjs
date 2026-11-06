// Import a narration recording and its word timings.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {digest,parseNarration,narrationKey,phraseTime} from './lib.mjs';
const [id,audioPath,timingPath]=process.argv.slice(2);
if(!id||!audioPath||!timingPath) throw Error('Usage: npm run import:narration -- SCENE AUDIO.mp3 TIMING.json');
const config=JSON.parse(await readFile('scenes.json','utf8'));
const scene=config.scenes.find(s=>s.id===id); if(!scene) throw Error('Unknown scene');
const raw=await readFile('narration.md','utf8');
const approval=JSON.parse(await readFile('approval.json','utf8'));
if(approval.hash!==digest(raw)) throw Error('Current words need Mat’s approval before import.');
const text=parseNarration(raw)[id];
const result=JSON.parse(await readFile(timingPath,'utf8'));
if(result.voice_id!==config.voice.id||result.text!==text) throw Error('Import must match the configured voice ID and approved script.');
if(!Array.isArray(result.words)||!result.words.length) throw Error('No aligned words');
let previous=0;
for(const word of result.words) {
 if(typeof word.text!=='string'||!Number.isFinite(word.start)||!Number.isFinite(word.end)||word.start<previous||word.end<word.start) throw Error('Invalid word timing');
 previous=word.end;
}
// Confirm recognition covers the whole spoken script (ignoring punctuation/case).
const normal=s=>s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
if(normal(result.words.map(w=>w.text).join(' '))!==normal(text)) throw Error('Transcript differs from script; review alignment before import.');
for(const cue of scene.cues) phraseTime(result.words,cue.phrase,cue.occurrence);
if(result.duration!==undefined && (!Number.isFinite(result.duration) || result.duration<previous)) throw Error('Audio duration ends before the last word');
await mkdir('public/audio',{recursive:true});
await copyFile(audioPath,`public/audio/${id}.mp3`);
await writeFile(`public/audio/${id}.json`,JSON.stringify({hash:narrationKey(text,config.voice),words:result.words,voice:result.voice_id,duration:result.duration,source:result.source},null,2));
console.log(`Imported aligned ${config.voice.name} narration: ${id}`);
