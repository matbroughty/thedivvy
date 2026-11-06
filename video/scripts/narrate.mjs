import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {digest,parseNarration,narrationKey,wordsFromAlignment} from './lib.mjs';
const raw=await readFile('narration.md','utf8');
const approval=JSON.parse(await readFile('approval.json','utf8').catch(()=>'{"hash":null}'));
if(approval.hash!==digest(raw)) throw Error('Narration is unapproved or has changed. Obtain Mat’s approval first.');
const key=process.env.ELEVENLABS_API_KEY;
if(!key) throw Error('Set ELEVENLABS_API_KEY in video/.env.local or the shell.');
const config=JSON.parse(await readFile('scenes.json','utf8'));
async function request(path,options={}) {
 const res=await fetch(`https://api.elevenlabs.io/v1/${path}`,{...options,headers:{'xi-api-key':key,'Content-Type':'application/json'},signal:AbortSignal.timeout(120000)});
 if(!res.ok) throw Error(`ElevenLabs HTTP ${res.status}; no automatic retries (avoid duplicate charges).`);
 return res.json();
}
const voice=await request(`voices/${config.voice.id}`);
if(voice.name!==config.voice.name) throw Error('ElevenLabs voice name does not match the narration configuration.');
const texts=parseNarration(raw);
await mkdir('public/audio',{recursive:true});
for(const scene of config.scenes) {
 const text=texts[scene.id]; if(!text) throw Error(`Missing narration: ${scene.id}`);
 const hash=narrationKey(text,config.voice), base=`public/audio/${scene.id}`;
 const cached=JSON.parse(await readFile(`${base}.json`,'utf8').catch(()=>'{}'));
 if(cached.hash===hash && await readFile(`${base}.mp3`).then(b=>b.length>0).catch(()=>false)){console.log(`Cached: ${scene.id}`);continue;}
 // Official timing endpoint: connector speech generation currently returns no character alignment.
 const result=await request(`text-to-speech/${config.voice.id}/with-timestamps?output_format=mp3_44100_128`,{method:'POST',body:JSON.stringify({text,model_id:config.voice.model,voice_settings:config.voice.settings})});
 // Save the paid response before validation so it can be recovered without a second charge.
 await writeFile(`${base}.response.json`,JSON.stringify(result));
 const words=wordsFromAlignment(result.normalized_alignment ?? result.alignment);
 if(!result.audio_base64 || !words.length) throw Error(`Missing audio/timing for ${scene.id}`);
 await writeFile(`${base}.mp3`,Buffer.from(result.audio_base64,'base64'));
 await writeFile(`${base}.json`,JSON.stringify({hash,words,voice:config.voice.id},null,2));
 console.log(`Generated: ${scene.id}`);
}
