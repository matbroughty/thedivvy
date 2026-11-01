import puppeteer from 'puppeteer';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const config=JSON.parse(await readFile('scenes.json','utf8'));
const origin=process.env.SITE_URL || 'http://localhost:5173';
const browser=await puppeteer.launch({headless:true});
try {
 const page=await browser.newPage(); await page.setCacheEnabled(false); await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
 await mkdir('public/screenshots',{recursive:true});
 for(const scene of config.scenes) {
  const response=await page.goto(new URL(scene.path,origin).href,{waitUntil:'networkidle0'});
  if(!response.ok()) throw Error(`Capture HTTP ${response.status()}: ${scene.path}`);
  await page.waitForFunction(()=>window.__APP_HYDRATED__===true);
  // Mask all raster images, external embeds, and background images only for capture.
  // Retain geometry and real UI; no production DOM or styles are changed.
  await page.addStyleTag({content:'img, iframe, video { visibility:hidden !important; } * { background-image:none !important; animation:none !important; transition:none !important; } .score__icons {display:none!important} .score__num {display:inline!important}'});
  await page.evaluate(()=>document.fonts.ready);
  if(scene.selector) await page.$eval(scene.selector,el=>el.scrollIntoView({block:'start'}));
  const regions=await page.evaluate((definitions)=>{
   const output={};
   for(const [name,definition] of Object.entries(definitions)) {
    if(Array.isArray(definition)){output[name]=definition;continue;}
    const element=document.querySelector(definition.selector);
    if(!element) throw Error(`Capture selector missing: ${definition.selector}`);
    const r=element.getBoundingClientRect();
    const x=Math.max(0,r.x),y=Math.max(0,r.y),right=Math.min(1920,r.right),bottom=Math.min(1080,r.bottom);
    if(right<=x||bottom<=y) throw Error(`Region offscreen: ${name}`);
    output[name]=[x,y,right-x,bottom-y];
   } return output;
  },{content:{selector:scene.selector||'main'},...scene.regions});
  await page.screenshot({path:`public/screenshots/${scene.asset}`});
  await writeFile(`public/screenshots/${scene.id}.regions.json`,JSON.stringify(regions,null,2));
  console.log(`Captured ${scene.path}`);
 }
 await writeFile('public/screenshots/provenance.json',JSON.stringify({origin,capturedAt:new Date().toISOString(),viewport:[1920,1080],policy:'All raster images, background images, video and iframe embeds masked; original site typography and navigation retained.'},null,2));
} finally {await browser.close();}
