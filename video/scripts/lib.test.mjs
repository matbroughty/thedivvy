import test from 'node:test';
import assert from 'node:assert/strict';
import {parseNarration,wordsFromAlignment,phraseTime,narrationKey} from './lib.mjs';
test('narration sections remain independent and preserve final section',()=>{
 assert.deepEqual(parseNarration('# Draft\n\n## first\nHello\nthere.\n\n## last\nGoodbye.\n'),{first:'Hello there.',last:'Goodbye.'});
});
test('character timing drives phrases, including punctuation and repeated occurrences',()=>{
 const text='Read my review. Read my review!';
 const words=wordsFromAlignment({characters:[...text],character_start_times_seconds:[...text].map((_,i)=>i/10),character_end_times_seconds:[...text].map((_,i)=>(i+1)/10)});
 assert.equal(phraseTime(words,'read my review'),0);
 assert.equal(phraseTime(words,'read my review',2),1.6);
 assert.throws(()=>phraseTime(words,'select a series'),/not found/);
 assert.throws(()=>wordsFromAlignment({characters:['a']}),/Invalid/);
});
test('narration cache changes with text, voice model and settings',()=>{
 const voice={id:'actual',model:'v2',settings:{stability:0.5}};
 const key=narrationKey('Hello',voice);
 assert.equal(key,narrationKey('Hello',voice));
 assert.notEqual(key,narrationKey('Changed',voice));
 assert.notEqual(key,narrationKey('Hello',{...voice,model:'v3'}));
 assert.notEqual(key,narrationKey('Hello',{...voice,settings:{stability:0.6}}));
});
