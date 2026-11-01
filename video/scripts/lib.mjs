import {createHash} from 'node:crypto';
export function parseNarration(markdown) {
  return Object.fromEntries([...markdown.matchAll(/^## ([\w-]+)\s*\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm)].map(([,id,text])=>[id,text.trim().replace(/\s+/g,' ')]));
}
export const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function wordsFromAlignment(a) {
  if (!a || !a.characters?.length || a.characters.length !== a.character_start_times_seconds?.length || a.characters.length !== a.character_end_times_seconds?.length) throw Error('Invalid character alignment');
  const words=[]; let word=null;
  a.characters.forEach((c,i)=>{
    const start=a.character_start_times_seconds[i], end=a.character_end_times_seconds[i];
    if (!Number.isFinite(start)||!Number.isFinite(end)||end<start||start<0||(i && start<a.character_start_times_seconds[i-1])) throw Error('Invalid alignment times');
    if (/\s/.test(c)) {if(word) words.push(word); word=null;}
    else {if(!word) word={text:'',start,end}; word.text+=c; word.end=end;}
  });
  if(word) words.push(word); return words;
}
const normal = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export function phraseTime(words,phrase,occurrence=1) {
  const target=phrase.split(/\s+/).map(normal).filter(Boolean); let count=0;
  if (!target.length) throw Error('Empty cue phrase');
  for(let i=0;i<=words.length-target.length;i++) if(target.every((t,j)=>normal(words[i+j].text)===t) && ++count===occurrence) return words[i].start;
  throw Error(`Cue phrase not found: ${phrase} (occurrence ${occurrence})`);
}
export function previewWords(text) {
  return text.split(/\s+/).map((text,i)=>({text,start:i*60/145,end:(i+1)*60/145}));
}
export function narrationKey(text,voice) { return digest({text,voice,format:'mp3_44100_128'}); }
export function vttTime(seconds) {return new Date(Math.round(seconds*1000)).toISOString().slice(11,23);}
