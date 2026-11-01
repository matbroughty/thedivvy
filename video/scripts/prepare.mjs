import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {parseNarration,previewWords,phraseTime,narrationKey,vttTime,digest} from './lib.mjs';
const config=JSON.parse(await readFile('scenes.json','utf8'));
const raw=await readFile('narration.md','utf8'), texts=parseNarration(raw);
const final=process.argv.includes('--final');
if(final) {
 const approval=JSON.parse(await readFile('approval.json','utf8'));
 if(approval.hash!==digest(raw)) throw Error('Final render requires approval of the current script.');
}
let offset=0; const scenes=[]; let captions='WEBVTT\n\n';
for(const scene of config.scenes) {
 const text=texts[scene.id]; if(!text) throw Error(`Missing narration ${scene.id}`);
 const cache=JSON.parse(await readFile(`public/audio/${scene.id}.json`,'utf8').catch(()=>'{}'));
 const valid=cache.hash===narrationKey(text,config.voice) && await readFile(`public/audio/${scene.id}.mp3`).then(b=>b.length>0).catch(()=>false);
 if(final&&!valid) throw Error(`Missing or stale narration: ${scene.id}`);
 const words=final?cache.words:previewWords(text);
 const regions=JSON.parse(await readFile(`public/screenshots/${scene.id}.regions.json`,'utf8'));
 const duration=Math.ceil((words.at(-1).end+0.8)*config.fps);
 const cues=scene.cues.map(c=>{
  if(!regions[c.region]) throw Error(`Missing region ${c.region} in ${scene.id}`);
  if(!(c.zoom>=1 && c.zoom<=3 && c.duration>0)) throw Error(`Invalid camera cue in ${scene.id}`);
  return {...c,at:phraseTime(words,c.phrase,c.occurrence),target:regions[c.region]};
 });
 const chunks=[];
 for(let i=0;i<words.length;i+=9) {
  const group=words.slice(i,i+9), start=group[0].start, end=group.at(-1).end, line=group.map(w=>w.text).join(' ');
  chunks.push({start,end,text:line});
  captions+=`${vttTime(offset/config.fps+start)} --> ${vttTime(offset/config.fps+end)}\n${line}\n\n`;
 }
 scenes.push({...scene,text,regions,cues,chunks,from:offset,duration,audio:final?`audio/${scene.id}.mp3`:null}); offset+=duration;
}
await mkdir('src',{recursive:true}); await mkdir('output',{recursive:true});
await writeFile('src/timeline.json',JSON.stringify({...config,scenes,duration:offset,draft:!final},null,2));
await writeFile('output/captions.vtt',captions.trimEnd()+'\n');
await writeFile('output/transcript.json',JSON.stringify(scenes.map(({id,title,text})=>({id,title,text})),null,2));
console.log(`${final?'ALIGNED FINAL':'SILENT DRAFT — estimated timing'}: ${(offset/config.fps).toFixed(1)} seconds`);
