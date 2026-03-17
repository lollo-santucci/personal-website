'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// ── Colors ─────────────────────────────────────────────────────────────────
const C = {
  accent: '#fc5c46',
  violet: '#b87dfe',
  lime: '#cbfd00',
  white: '#fffdfa',
  screenBg: '#0a0a12',
} as const;

// ── Pixel scale ────────────────────────────────────────────────────────────
const PX = 3;

// ── Sprites ────────────────────────────────────────────────────────────────
const INVADER_SPRITES: number[][][] = [
  [
    [0,0,1,0,0,0,1,0, 0,0,0,1,0,1,0,0, 0,0,1,1,1,1,1,0, 0,1,1,0,1,0,1,1, 1,1,1,1,1,1,1,1, 1,0,1,1,1,1,0,1, 1,0,1,0,0,1,0,1, 0,0,0,1,1,0,0,0],
    [0,0,1,0,0,0,1,0, 1,0,0,1,0,1,0,0, 1,0,1,1,1,1,1,0, 1,1,1,0,1,0,1,1, 1,1,1,1,1,1,1,1, 0,1,1,1,1,1,1,0, 0,0,1,0,0,1,0,0, 0,1,0,0,0,0,1,0],
  ],
  [
    [0,0,0,1,1,0,0,0, 0,0,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 1,1,0,1,1,0,1,1, 1,1,1,1,1,1,1,1, 0,0,1,0,0,1,0,0, 0,1,0,1,1,0,1,0, 1,0,1,0,0,1,0,1],
    [0,0,0,1,1,0,0,0, 0,0,1,1,1,1,0,0, 0,1,1,1,1,1,1,0, 1,1,0,1,1,0,1,1, 1,1,1,1,1,1,1,1, 0,1,0,1,1,0,1,0, 1,0,0,0,0,0,0,1, 0,1,0,0,0,0,1,0],
  ],
];

const SHIP_W = 13, SHIP_H = 7;
const SHIP_SPRITE = [
  0,0,0,0,0,0,1,0,0,0,0,0,0,
  0,0,0,0,0,1,1,1,0,0,0,0,0,
  0,0,0,0,1,1,1,1,1,0,0,0,0,
  0,0,1,1,1,1,1,1,1,1,1,0,0,
  0,1,1,1,1,1,1,1,1,1,1,1,0,
  1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,1,0,0,0,0,0,1,0,0,1,
];

  const PLAY_ICON = [                                                                                                           
    0,1,0,0,0,                                                                                                                  
    0,1,1,0,0,                                
    0,1,1,1,0,                                                                                                                  
    0,1,1,1,1,                                                                                                                
    0,1,1,1,0,                                                                                                                  
    0,1,1,0,0,                                                                                                                  
    0,1,0,0,0,                                                                                                                  
  ];    

// ── 5×5 pixel font ─────────────────────────────────────────────────────────
const F: Record<string, number[]> = {
  A:[0,1,1,0,0,1,0,0,1,0,1,1,1,1,0,1,0,0,1,0,1,0,0,1,0],
  C:[0,1,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,1,1,1,0],
  E:[1,1,1,1,0,1,0,0,0,0,1,1,1,0,0,1,0,0,0,0,1,1,1,1,0],
  G:[0,1,1,1,0,1,0,0,0,0,1,0,1,1,0,1,0,0,1,0,0,1,1,1,0],
  I:[0,1,1,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1,1,1,0],
  L:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,1,1,1,0],
  M:[1,0,0,0,1,1,1,0,1,1,1,0,1,0,1,1,0,0,0,1,1,0,0,0,1],
  N:[1,0,0,0,1,1,1,0,0,1,1,0,1,0,1,1,0,0,1,1,1,0,0,0,1],
  O:[0,1,1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1,1,0,0],
  P:[1,1,1,0,0,1,0,0,1,0,1,1,1,0,0,1,0,0,0,0,1,0,0,0,0],
  R:[1,1,1,0,0,1,0,0,1,0,1,1,1,0,0,1,0,1,0,0,1,0,0,1,0],
  S:[0,1,1,1,0,1,0,0,0,0,0,1,1,0,0,0,0,0,1,0,1,1,1,0,0],
  T:[1,1,1,1,1,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0],
  V:[1,0,0,0,1,1,0,0,0,1,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0],
  Y:[1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0],
  ' ':[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  '0':[0,1,1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,0,1,1,0,0],
  '1':[0,0,1,0,0,0,1,1,0,0,0,0,1,0,0,0,0,1,0,0,0,1,1,1,0],
  '2':[0,1,1,0,0,1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1,1,1,0],
  '3':[1,1,1,0,0,0,0,0,1,0,0,1,1,0,0,0,0,0,1,0,1,1,1,0,0],
  '4':[1,0,0,1,0,1,0,0,1,0,1,1,1,1,0,0,0,0,1,0,0,0,0,1,0],
  '5':[1,1,1,1,0,1,0,0,0,0,1,1,1,0,0,0,0,0,1,0,1,1,1,0,0],
  '6':[0,1,1,0,0,1,0,0,0,0,1,1,1,0,0,1,0,0,1,0,0,1,1,0,0],
  '7':[1,1,1,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0],
  '8':[0,1,1,0,0,1,0,0,1,0,0,1,1,0,0,1,0,0,1,0,0,1,1,0,0],
  '9':[0,1,1,0,0,1,0,0,1,0,0,1,1,1,0,0,0,0,1,0,0,1,1,0,0],
};
const FW=5,FH=5;

function drawText(ctx:CanvasRenderingContext2D,text:string,cx:number,cy:number,color:string,px:number){
  const total=text.length*(FW+1)-1;let x=cx-total/2;const y=cy-FH/2;
  ctx.fillStyle=color;
  for(const ch of text){const g=F[ch];if(g){for(let r=0;r<FH;r++)for(let c=0;c<FW;c++)if(g[r*FW+c])ctx.fillRect(Math.round((x+c)*px),Math.round((y+r)*px),px,px);}x+=FW+1;}
}
function drawSprite(ctx:CanvasRenderingContext2D,sprite:number[],w:number,h:number,x:number,y:number,color:string,px:number){
  ctx.fillStyle=color;for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(sprite[r*w+c])ctx.fillRect(Math.round((x+c)*px),Math.round((y+r)*px),px,px);
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Inv{x:number;y:number;type:number;alive:boolean}
interface Bul{x:number;y:number;dy:number;color:string}
interface Expl{x:number;y:number;color:string;frame:number;t:number}

const INV=8,GAP=5,ROWS=3,BASE_COLS=8;
const MOVE_MS=600,WIG_MS=500,BSPD=1.8,ENE_MS=1500;
const EX_MS=100,EX_FR=4,SHIP_OFF=3,EDGE=2;
const ROW_C=[C.lime,C.violet];
const EX_P:[ number,number][][]=[[[-1,-1],[1,-1],[-1,1],[1,1],[0,0]],[[-2,-2],[2,-2],[-2,2],[2,2],[0,-1],[0,1],[-1,0],[1,0]],[[-3,-1],[3,-1],[-1,-3],[1,3],[2,0],[-2,0],[0,2],[0,-2]],[[-3,-3],[3,3],[-3,3],[3,-3]]];

type Phase='attract'|'playing'|'win'|'gameover';

export default function FooterInvaders(){
  const cvRef=useRef<HTMLCanvasElement>(null);
  const [phase,setPhase]=useState<Phase>('attract');
  const pRef=useRef<Phase>('attract');
  const s=useRef({
    inv:[] as Inv[],bul:[] as Bul[],expl:[] as Expl[],
    shipX:0,dir:1,lastMv:0,lastWig:0,wigF:0,lastEF:0,
    pB:false,cols:BASE_COLS,anim:0,vis:false,red:false,
    goTime:0,score:0,logW:0,logH:0,
  }).current;

  const spawnWave=useCallback((cols:number)=>{
    s.inv=[];
    // Clamp columns to what fits on screen (with EDGE margin each side)
    const maxCols=Math.max(1,Math.floor((s.logW-EDGE*2+GAP)/(INV+GAP)));
    const useCols=Math.min(cols,maxCols);
    s.cols=useCols;
    const tw=useCols*INV+(useCols-1)*GAP;
    const sx=Math.floor((s.logW-tw)/2);
    for(let r=0;r<ROWS;r++)for(let c=0;c<useCols;c++)
      s.inv.push({x:sx+c*(INV+GAP),y:3+r*(INV+GAP),type:r%2,alive:true});
    s.dir=1;s.bul=[];s.expl=[];s.pB=false;
  },[s]);

  const startGame=useCallback(()=>{
    s.score=0;s.shipX=s.logW/2;
    spawnWave(BASE_COLS);
    pRef.current='playing';setPhase('playing');
  },[s,spawnWave]);

  useEffect(()=>{
    const cv=cvRef.current;if(!cv)return;
    const ctx=cv.getContext('2d');if(!ctx)return;

    const mql=window.matchMedia('(prefers-reduced-motion: reduce)');
    s.red=mql.matches;
    const mh=(e:MediaQueryListEvent)=>{s.red=e.matches;};
    mql.addEventListener('change',mh);

    function resize(){
      const rect=cv!.getBoundingClientRect();
      const dpr=window.devicePixelRatio||1;
      cv!.width=Math.round(rect.width*dpr);
      cv!.height=Math.round(rect.height*dpr);
      ctx!.setTransform(dpr,0,0,dpr,0,0);
      s.logW=rect.width/PX;
      s.logH=rect.height/PX;
    }
    resize();
    window.addEventListener('resize',resize);

    const obs=new IntersectionObserver(([e])=>{s.vis=e.isIntersecting;},{threshold:0.1});
    obs.observe(cv);

    function onMove(e:MouseEvent){
      if(pRef.current!=='playing')return;
      const rect=cv!.getBoundingClientRect();
      const mx=(e.clientX-rect.left)/PX;
      s.shipX=Math.max(0,Math.min(s.logW-SHIP_W,mx-SHIP_W/2));
    }
    function onClick(){
      if(pRef.current==='attract'||pRef.current==='win'||pRef.current==='gameover'){startGame();return;}
      if(s.pB)return;
      s.pB=true;
      s.bul.push({x:s.shipX+SHIP_W/2,y:s.logH-SHIP_OFF-SHIP_H,dy:-BSPD,color:C.lime});
    }
    cv.addEventListener('mousemove',onMove);
    cv.addEventListener('click',onClick);

    let last=0;
    function loop(now:number){
      s.anim=requestAnimationFrame(loop);
      if(!s.vis)return;
      if(now-last<16)return;
      last=now;
      const p=pRef.current;
      const W=s.logW,H=s.logH;

      ctx!.fillStyle=C.screenBg;
      ctx!.fillRect(0,0,W*PX,H*PX);

      if(p==='attract'){
        // Play triangle (pixel art) centered above text
        const triX=Math.floor(W/2)-3,triY=Math.floor(H/2)-8;
        ctx!.fillStyle=C.lime;
        drawSprite(ctx!, PLAY_ICON, 5, 7, W/2-2, H/2-10, C.lime, PX);
        if(Math.floor(now/600)%2===0)
          drawText(ctx!,'PLAY GAME',W/2,H/2+4,C.lime,PX);

      }else if(p==='playing'){
        if(!s.red){
          if(now-s.lastMv>MOVE_MS){
            s.lastMv=now;let edge=false;
            for(const i of s.inv){if(!i.alive)continue;if((s.dir>0&&i.x+INV>=W-EDGE)||(s.dir<0&&i.x<=EDGE)){edge=true;break;}}
            if(edge){s.dir*=-1;for(const i of s.inv)if(i.alive)i.y+=1;}
            else for(const i of s.inv)if(i.alive)i.x+=s.dir*2;
          }
          if(now-s.lastWig>WIG_MS){s.lastWig=now;s.wigF=s.wigF===0?1:0;}

          for(let i=s.bul.length-1;i>=0;i--){
            const b=s.bul[i];b.y+=b.dy;
            if(b.y<-2||b.y>H+2){if(b.dy<0)s.pB=false;s.bul.splice(i,1);continue;}
            if(b.dy<0){for(const inv of s.inv){if(!inv.alive)continue;if(b.x>=inv.x&&b.x<=inv.x+INV&&b.y>=inv.y&&b.y<=inv.y+INV){inv.alive=false;s.pB=false;s.bul.splice(i,1);s.score+=10;s.expl.push({x:inv.x+INV/2,y:inv.y+INV/2,color:ROW_C[inv.type%2],frame:0,t:now});break;}}}
            if(b.dy>0){const sy=H-SHIP_OFF-SHIP_H;if(b.x>=s.shipX&&b.x<=s.shipX+SHIP_W&&b.y>=sy&&b.y<=sy+SHIP_H){s.bul.splice(i,1);s.expl.push({x:s.shipX+SHIP_W/2,y:sy+SHIP_H/2,color:C.white,frame:0,t:now});s.goTime=now;s.bul=[];s.pB=false;pRef.current='gameover';setPhase('gameover');}}
          }

          if(now-s.lastEF>ENE_MS){s.lastEF=now;const alive=s.inv.filter(i=>i.alive);if(alive.length>0){const sh=alive[Math.floor(Math.random()*alive.length)];s.bul.push({x:sh.x+INV/2,y:sh.y+INV,dy:BSPD*0.7,color:ROW_C[sh.type%2]});}}
          for(let i=s.expl.length-1;i>=0;i--){s.expl[i].frame=Math.floor((now-s.expl[i].t)/EX_MS);if(s.expl[i].frame>=EX_FR)s.expl.splice(i,1);}
          if(s.inv.length>0&&s.inv.every(i=>!i.alive)){s.goTime=now;pRef.current='win';setPhase('win');}
        }
        for(const i of s.inv){if(!i.alive)continue;drawSprite(ctx!,INVADER_SPRITES[i.type%2][s.wigF],INV,INV,i.x,i.y,ROW_C[i.type%2],PX);}
        for(const b of s.bul){ctx!.fillStyle=b.color;ctx!.fillRect(Math.round(b.x*PX),Math.round(b.y*PX),PX*2,PX*5);}
        for(const ex of s.expl){if(ex.frame<EX_FR){ctx!.fillStyle=ex.color;for(const[ox,oy]of EX_P[ex.frame])ctx!.fillRect(Math.round((ex.x+ox)*PX),Math.round((ex.y+oy)*PX),PX,PX);}}
        drawSprite(ctx!,SHIP_SPRITE,SHIP_W,SHIP_H,s.shipX,H-SHIP_OFF-SHIP_H,C.white,PX);
        drawText(ctx!,String(s.score),W-15,4,C.white,PX);

      }else if(p==='win'){
        drawText(ctx!,'GREAT GAME',W/2,H/2-6,C.lime,PX);
        drawText(ctx!,String(s.score),W/2,H/2+2,C.white,PX);
        if(Math.floor(now/500)%2===0)drawText(ctx!,'PLAY AGAIN',W/2,H/2+12,C.accent,PX);

      }else{
        // gameover
        for(const i of s.inv){if(!i.alive)continue;drawSprite(ctx!,INVADER_SPRITES[i.type%2][s.wigF],INV,INV,i.x,i.y,ROW_C[i.type%2],PX);}
        for(let i=s.expl.length-1;i>=0;i--){s.expl[i].frame=Math.floor((now-s.expl[i].t)/EX_MS);if(s.expl[i].frame>=EX_FR){s.expl.splice(i,1);continue;}ctx!.fillStyle=s.expl[i].color;for(const[ox,oy]of EX_P[s.expl[i].frame])ctx!.fillRect(Math.round((s.expl[i].x+ox)*PX),Math.round((s.expl[i].y+oy)*PX),PX,PX);}
        drawText(ctx!,'GAME OVER',W/2,H/2-6,C.white,PX);
        drawText(ctx!,String(s.score),W/2,H/2+2,C.lime,PX);
        if(Math.floor(now/500)%2===0)drawText(ctx!,'PLAY AGAIN',W/2,H/2+12,C.accent,PX);
      }

      // Scanlines
      ctx!.save();ctx!.globalAlpha=0.04;
      for(let y=0;y<H*PX;y+=2){ctx!.fillStyle='#000';ctx!.fillRect(0,y,W*PX,1);}
      ctx!.restore();
    }

    s.anim=requestAnimationFrame(loop);
    return()=>{cancelAnimationFrame(s.anim);window.removeEventListener('resize',resize);obs.disconnect();mql.removeEventListener('change',mh);cv.removeEventListener('mousemove',onMove);cv.removeEventListener('click',onClick);};
  },[s,spawnWave,startGame]);

  const cursor=phase==='playing'?'crosshair':'pointer';

  return(
    <canvas
      ref={cvRef}
      className="h-full w-full"
      style={{imageRendering:'pixelated',cursor}}
      aria-hidden="true"
    />
  );
}
