import {spawnSync} from 'node:child_process';
import puppeteer from 'puppeteer';
const browser=await puppeteer.executablePath();
const preview=process.argv.includes('--preview');
function run(args){const result=spawnSync(process.execPath,args,{stdio:'inherit'});if(result.status!==0)process.exit(result.status??1);}
run(['scripts/prepare.mjs',...(preview?[]:['--final'])]);
const cli='node_modules/@remotion/cli/remotion-cli.js';
run([cli,'render','src/index.tsx','Introduction',`output/introduction${preview?'-preview':''}.mp4`,'--codec','h264',`--browser-executable=${browser}`,'--concurrency=4']);
if(!preview){run([cli,'still','src/index.tsx','Introduction','output/poster.jpg','--frame=45',`--browser-executable=${browser}`]);run(['scripts/receipt.mjs']);}
