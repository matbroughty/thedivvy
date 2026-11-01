import {readFile,copyFile,writeFile,mkdir} from 'node:fs/promises';
import {digest,parseNarration,narrationKey} from './lib.mjs';
const raw=await readFile('narration.md','utf8');
const timeline=JSON.parse(await readFile('src/timeline.json','utf8'));
const config=JSON.parse(await readFile('scenes.json','utf8'));
const approval=JSON.parse(await readFile('approval.json','utf8'));
const receipt=JSON.parse(await readFile('output/render-receipt.json','utf8'));
if(approval.hash!==digest(raw)||timeline.draft||receipt.timelineHash!==digest(timeline)) throw Error('Publish requires an approved, current final render.');
const texts=parseNarration(raw);
for(const scene of config.scenes) {
 const cache=JSON.parse(await readFile(`public/audio/${scene.id}.json`,'utf8'));
 if(cache.hash!==narrationKey(texts[scene.id],config.voice)) throw Error(`Stale audio: ${scene.id}`);
}
if(receipt.configHash!==digest(config)||receipt.scriptHash!==digest(raw)) throw Error('Configuration or script changed since rendering.');
const directory='../public/videos/introduction';await mkdir(directory,{recursive:true});
for(const name of ['introduction.mp4','poster.jpg','captions.vtt']) await copyFile(`output/${name}`,`${directory}/${name}`);
await writeFile('../src/data/introduction-video.json',JSON.stringify({ready:true,src:'/videos/introduction/introduction.mp4',poster:'/videos/introduction/poster.jpg',captions:'/videos/introduction/captions.vtt',transcript:timeline.scenes.map(({id,title,text})=>({id,title,text}))},null,2)+'\n');
console.log('Updated local About-page assets. No deployment performed.');
