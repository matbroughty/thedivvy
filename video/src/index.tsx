import React from 'react';
import {AbsoluteFill, Audio, Composition, Img, Sequence, interpolate, registerRoot, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';

type Scene = typeof timeline.scenes[number];
const W=1920, H=1080;
function Shot({scene,captions}: {scene:Scene;captions:boolean}) {
 const frame=useCurrentFrame(), {fps}=useVideoConfig();
 let camera={x:W/2,y:H/2,zoom:1}, highlight:number[]|null=null;
 for(const cue of scene.cues) {
  const at=cue.at*fps;
  if(frame<at) break;
  const t=interpolate(frame,[at,at+cue.duration*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  const eased=t*t*(3-2*t), [x,y,w,h]=cue.target;
  // Clamp the camera centre to prevent revealing empty space beyond screenshot edges.
  const cx=Math.max(W/(2*cue.zoom),Math.min(W-W/(2*cue.zoom),x+w/2));
  const cy=Math.max(H/(2*cue.zoom),Math.min(H-H/(2*cue.zoom),y+h/2));
  camera={x:camera.x+(cx-camera.x)*eased,y:camera.y+(cy-camera.y)*eased,zoom:camera.zoom+(cue.zoom-camera.zoom)*eased};
  highlight=cue.highlight?cue.target:null;
 }
 const opacity=interpolate(frame,[0,15,scene.duration-15,scene.duration],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const caption=scene.chunks.find(c=>frame/fps>=c.start&&frame/fps<c.end);
 const card=scene.id==='why'||scene.id==='closing';
 return <AbsoluteFill style={{opacity,background:'#f6f0e3',color:'#241c15',fontFamily:'Georgia, serif'}}>
  {card ? <AbsoluteFill style={{justifyContent:'center',padding:150}}>
   <div style={{width:100,height:5,background:'#b5895a',marginBottom:40}} />
   <div style={{fontSize:24,letterSpacing:6,textTransform:'uppercase',color:'#8a4b2a'}}>Mat Broughton</div>
   <h1 style={{fontSize:100,fontWeight:400,margin:'30px 0',transform:`translateY(${interpolate(frame,[0,40],[25,0],{extrapolateRight:'clamp'})}px)`}}>{scene.title}</h1>
   <div style={{fontSize:38,color:'#6b5a47'}}>{'subtitle' in scene?scene.subtitle:''}</div>
   <div style={{fontSize:28,marginTop:75,color:'#8a4b2a'}}>thedivvy.co.uk</div>
  </AbsoluteFill> : <>
   <div style={{position:'absolute',width:W,height:H,transformOrigin:'0 0',transform:`translate(${W/2-camera.x*camera.zoom}px, ${H/2-camera.y*camera.zoom}px) scale(${camera.zoom})`}}>
    <Img src={staticFile(`screenshots/${scene.asset}`)} style={{width:W,height:H}} />
    {highlight&&<div style={{position:'absolute',left:highlight[0],top:highlight[1],width:highlight[2],height:highlight[3],border:'4px solid #b5895a',boxShadow:'0 0 0 4px #fbf7ec99',borderRadius:8}}/>}
   </div>
   <div style={{position:'absolute',top:24,left:36,padding:'14px 26px',background:'#fbf7ec',borderLeft:'5px solid #8a4b2a',fontSize:28,boxShadow:'0 4px 20px #241c1522'}}>{scene.title}</div>
  </>}
  {timeline.draft&&<div style={{position:'absolute',right:30,top:30,fontFamily:'sans-serif',fontSize:18,background:'#241c15',color:'#fbf7ec',padding:12}}>SCRIPT DRAFT · SILENT · ESTIMATED TIMING</div>}
  {captions&&caption&&<div style={{position:'absolute',bottom:38,left:180,right:180,textAlign:'center',fontFamily:'sans-serif',fontSize:32,lineHeight:1.4}}><span style={{background:'#241c15ed',color:'#fbf7ec',padding:'12px 22px',boxDecorationBreak:'clone'}}>{caption.text}</span></div>}
  {scene.audio&&<Audio src={staticFile(scene.audio)}/>}
 </AbsoluteFill>;
}
function Introduction({captions=true}:{captions?:boolean}) {
 return <AbsoluteFill style={{background:'#f6f0e3'}}>{timeline.scenes.map(scene=><Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration}><Shot scene={scene} captions={captions}/></Sequence>)}</AbsoluteFill>;
}
const Root=()=> <Composition id="Introduction" component={Introduction} width={timeline.width} height={timeline.height} fps={timeline.fps} durationInFrames={timeline.duration} defaultProps={{captions:timeline.draft}}/>;
registerRoot(Root);
