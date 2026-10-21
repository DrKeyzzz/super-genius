'use strict';
// Hull damage, like a wrong answer in the Sharp or Flat tunnel but in the cockpit: every mistake punches a spreading crack
// into the window, throws glass and metal off the ship and heats the cockpit up. The third one burns the ship up
// in the atmosphere, then the screen goes black for END OF LINE.
window.HullFX=(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cv=document.createElement('canvas');cv.id='fx';cv.setAttribute('aria-hidden','true');document.body.append(cv);
 const heat=document.createElement('div');heat.id='heat';heat.setAttribute('aria-hidden','true');document.body.append(heat);
 const cx=cv.getContext('2d'),svg=document.getElementById('cracks'),NS='http://www.w3.org/2000/svg';
 let W,H,dpr,parts=[],embers=0,burning=0,last=0,damage=0;
 function size(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr}addEventListener('resize',size);size();
 // a seeded random, so a resumed flight shows the same cracks it had
 function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
 // one impact: a white star of jagged cracks spreading out from a point, with broken rings of glass around it
 function crack(n,animate){const r=rng(97+n*131),g=document.createElementNS(NS,'g');g.setAttribute('class','impact');
  const x=[220,760,500][n%3]+(r()-.5)*120,y=[110,90,170][n%3]+(r()-.5)*60,arms=9+Math.floor(r()*5),d=[];
  for(let i=0;i<arms;i++){let a=i/arms*6.283+r()*.5,px=x,py=y,len=120+r()*(260+n*90);let s=`M${x.toFixed(0)} ${y.toFixed(0)}`;
   for(let k=0;k<6;k++){const step=len/6;a+=(r()-.5)*.6;px+=Math.cos(a)*step*1.9;py+=Math.sin(a)*step*.75;s+=` L${px.toFixed(0)} ${py.toFixed(0)}`;
    if(r()<.35){const b=a+(r()<.5?-1:1)*(.6+r()*.6);s+=` M${px.toFixed(0)} ${py.toFixed(0)} l${(Math.cos(b)*step*1.4).toFixed(0)} ${(Math.sin(b)*step*.6).toFixed(0)} M${px.toFixed(0)} ${py.toFixed(0)}`}}d.push(s)}
  for(const ring of[38,86]){const segs=16,pt=i=>{const a=i/segs*6.283,rr=ring*(1+n*.25)*(.85+r()*.3);return`${(x+Math.cos(a)*rr*1.9).toFixed(0)} ${(y+Math.sin(a)*rr*.75).toFixed(0)}`};
   for(let i=0;i<segs;i++)if(r()>.3)d.push(`M${pt(i)} L${pt(i+1)}`)}
  const p=document.createElementNS(NS,'path');p.setAttribute('d',d.join(' '));g.append(p);
  const dot=document.createElementNS(NS,'ellipse');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('rx',14+n*4);dot.setAttribute('ry',7+n*2);dot.setAttribute('class','hole');g.append(dot);
  if(animate&&!reduced)g.classList.add('spread');svg.append(g);return{x:x/1000,y:y/300}}
 function heatUp(n){damage=n;document.body.style.setProperty('--heat',[0,.4,.75,1][Math.min(n,3)])}
 function setDamage(n){if(n===damage&&svg.querySelectorAll('.impact').length===Math.min(n,3))return;svg.querySelectorAll('.impact').forEach(e=>e.remove());for(let i=0;i<Math.min(n,3);i++)crack(i,false);heatUp(n)}
 // glass, hull plates and sparks thrown off the ship from where it was hit
 function burst(fx,fy,count,big){const b=document.getElementById('flightWindow').getBoundingClientRect(),ox=b.left+fx*b.width,oy=b.top+fy*b.height;
  for(let i=0;i<count;i++){const a=Math.random()*6.283,sp=(big?500:300)+Math.random()*(big?900:600),kind=Math.random();
   parts.push({x:ox+(Math.random()-.5)*40,y:oy+(Math.random()-.5)*30,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-200,rot:Math.random()*6.28,vr:(Math.random()-.5)*14,t:0,life:1+Math.random()*1.4,
    sz:kind<.55?6+Math.random()*(big?40:26):2+Math.random()*4,kind:kind<.35?'glass':kind<.55?'metal':'spark',
    p:[[-.5,-.35],[.5,-.2+Math.random()*.4],[Math.random()*.5-.25,.5]]})}}
 function hit(dead){const n=damage;const at=crack(n,true);heatUp(n+1);if(reduced)return;burst(at.x,at.y,dead?140:90,dead);
  heat.classList.remove('flash');void heat.offsetWidth;heat.classList.add('flash')}
 // the third mistake: everything glows red, then white-hot, flames lick in from the edges, the ship comes apart, then black
 function burn(done){burning=.001;document.body.classList.add('burning');if(reduced){setTimeout(done,600);return}
  const bursts=setInterval(()=>burst(Math.random(),Math.random(),40,true),260);setTimeout(()=>clearInterval(bursts),2600);
  setTimeout(()=>{document.body.classList.add('blackout')},3000);setTimeout(()=>{burning=0;parts=[];done()},4000)}
 function reset(){document.body.classList.remove('burning','blackout');burning=0;parts=[];svg.querySelectorAll('.impact').forEach(e=>e.remove());heatUp(0)}
 function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-last)/1000)||.016;last=t;cx.setTransform(dpr,0,0,dpr,0,0);cx.clearRect(0,0,W,H);
  if(burning){burning+=dt;const k=Math.min(1,burning/2.6);   // flames rising from the bottom and sides, growing white-hot
   for(let i=0;i<(reduced?0:Math.round(16+k*40));i++){const edge=Math.random();const x=edge<.6?Math.random()*W:edge<.8?Math.random()*W*.12:W-Math.random()*W*.12,y=edge<.6?H+10:Math.random()*H;
    parts.push({x,y,vx:(Math.random()-.5)*80,vy:-(200+Math.random()*500*(.5+k)),rot:0,vr:0,t:0,life:.5+Math.random()*.9,sz:16+Math.random()*60*(.4+k),kind:'flame'})}}
  else if(damage>=2&&!reduced&&Math.random()<damage*.25)parts.push({x:Math.random()*W,y:H+5,vx:(Math.random()-.5)*40,vy:-(60+Math.random()*120),rot:0,vr:0,t:0,life:2+Math.random()*2,sz:2+Math.random()*2.5,kind:'ember'});
  parts=parts.filter(p=>(p.t+=dt)<p.life);
  for(const p of parts){const k=1-p.t/p.life;p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(p.kind==='flame'){cx.globalCompositeOperation='lighter';const r=p.sz*(.6+k*.6),g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,r);g.addColorStop(0,`rgba(255,${200+Math.round(55*k)},${Math.round(120*k)},${.55*k})`);g.addColorStop(.5,`rgba(255,90,20,${.35*k})`);g.addColorStop(1,'rgba(160,20,0,0)');cx.fillStyle=g;cx.beginPath();cx.arc(p.x,p.y,r,0,7);cx.fill();cx.globalCompositeOperation='source-over';continue}
   if(p.kind==='ember'){cx.fillStyle=`rgba(255,${140+Math.round(80*k)},60,${k})`;cx.beginPath();cx.arc(p.x,p.y,p.sz,0,7);cx.fill();continue}
   p.vy+=900*dt;p.rot+=p.vr*dt;cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.globalAlpha=Math.min(1,k*1.4);
   if(p.kind==='spark'){cx.fillStyle='#ffd27a';cx.shadowColor='#ff8a2a';cx.shadowBlur=8;cx.fillRect(-p.sz,-1,p.sz*2.5,2)}
   else{const s=p.sz;cx.beginPath();cx.moveTo(p.p[0][0]*s,p.p[0][1]*s);cx.lineTo(p.p[1][0]*s,p.p[1][1]*s);cx.lineTo(p.p[2][0]*s,p.p[2][1]*s);cx.closePath();
    if(p.kind==='glass'){cx.fillStyle='rgba(200,230,255,.35)';cx.strokeStyle='rgba(255,255,255,.9)'}else{cx.fillStyle=burning?'#c2502a':'#7c8b9d';cx.strokeStyle=burning?'#ffb36b':'#c9d4e0'}cx.lineWidth=1;cx.fill();cx.stroke()}
   cx.restore()}}
 requestAnimationFrame(frame);
 return{hit,burn,reset,setDamage};
})();
