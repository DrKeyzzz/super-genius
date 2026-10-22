'use strict';
// The rocket window. The camera looks back the way we came: Earth and everything we pass fall away toward the point
// behind us. Stars always stream past; every right answer fires the engines and shoots us further from Earth.
window.SpaceFlight=(()=>{
 const cv=document.getElementById('space'),cx=cv.getContext('2d');let w,h,dpr,last=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const L=600;   // the whole journey (all three tiers) in world units; one challenge is about 10
 let Z=0,goal=0,speed=0,blast=0,confetti=0,shake=0,flare=0,rivals=[],passedMsg=0;
 const planets=[{at:.1,n:'Moon',r:2.2,a:-.6,c:['#f4f4f4','#b9b9c0','#5b5b65']},{at:.24,n:'Mars',r:2,a:2.4,c:['#ffb27a','#d2552b','#6e2412']},{at:.38,n:'Asteroid belt',belt:1},
  {at:.52,n:'Jupiter',r:5.5,a:-2.3,c:['#f1e2c8','#c99a6b','#7a4a2a'],bands:1},{at:.65,n:'Saturn',r:4.5,a:.7,c:['#f6e3b4','#d7b878','#7a6338'],ring:1},
  {at:.77,n:'Uranus',r:3.2,a:-.4,c:['#d8fbff','#7fd6e0','#2f7f8c']},{at:.88,n:'Neptune',r:3.2,a:2.8,c:['#9fb8ff','#3f5fe0','#172a7a']},{at:.98,n:'Beyond',r:1.1,a:1.5,c:['#f2e2d0','#b89c86','#5e4a3c']}];
 const rocks=Array.from({length:90},()=>({a:Math.random()*6.28,r:1.6+Math.random()*3.5,z:.38*L+Math.random()*20,s:.03+Math.random()*.15}));
 const stars=Array.from({length:220},()=>({a:Math.random()*6.28,r:.5+Math.random()*7,z:Math.random()*40}));
 let drift=0;   // stars keep moving even between answers
 function size(){const b=cv.getBoundingClientRect();w=b.width;h=b.height;dpr=Math.min(devicePixelRatio||1,2);cv.width=w*dpr;cv.height=h*dpr}new ResizeObserver(size).observe(cv);size();
 const VP=()=>({x:w*.62,y:h*.58}),F=()=>Math.max(w*.55,h*1.1);
 // d = how far behind us a thing is. Big at the edge right after we pass it, then it shrinks toward the point behind us.
 function proj(a,r,d){const v=VP(),f=F()/Math.max(.05,d);return[v.x+Math.cos(a)*r*f,v.y+Math.sin(a)*r*f*.6,f]}
 const fadeIn=d=>Math.min(1,Math.max(0,(d-.5)/1.5));
 function ball(x,y,R,c){const g=cx.createRadialGradient(x-R*.4,y-R*.4,R*.08,x,y,R);c.forEach((col,i)=>g.addColorStop(i/(c.length-1),col));cx.fillStyle=g;cx.beginPath();cx.arc(x,y,R,0,7);cx.fill()}
 function earth(t){const d=Z+4,v=VP(),R=F()*2/d;if(R<1)return;ball(v.x,v.y,R,['#8fd0ff','#2a6fd6','#0b2a66']);
  cx.save();cx.beginPath();cx.arc(v.x,v.y,R,0,7);cx.clip();const spin=t/40000;cx.fillStyle='#3d9a5a';
  [[-.35,-.2,.32],[.3,.15,.28],[-.05,.45,.2],[.45,-.4,.15],[1.2,.1,.3]].forEach(([a,b,r])=>{const x=((a+spin+1.5)%3)-1.5;cx.beginPath();cx.ellipse(v.x+x*R,v.y+b*R,r*R,r*R*.7,a*3,0,7);cx.fill()});
  cx.fillStyle='rgba(255,255,255,.4)';[[.1,-.5,.3],[-.4,.3,.25]].forEach(([a,b,r])=>{const x=((a+spin*1.6+1.5)%3)-1.5;cx.beginPath();cx.ellipse(v.x+x*R,v.y+b*R,r*R,r*R*.22,0,0,7);cx.fill()});cx.restore();
  cx.strokeStyle='rgba(140,200,255,.55)';cx.lineWidth=Math.max(1,R*.03);cx.beginPath();cx.arc(v.x,v.y,R*1.015,0,7);cx.stroke()}
 function planet(p){const d=Z-p.at*L;if(d<.3||d>150)return;const al=fadeIn(d)*Math.min(1,(150-d)/40);cx.globalAlpha=al;
  if(p.belt){rocks.forEach(r=>{const dd=Z-r.z;if(dd<.3||dd>80)return;const q=proj(r.a,r.r,dd),rr=q[2]*r.s;cx.fillStyle='#8a7a6a';cx.beginPath();cx.ellipse(q[0],q[1],rr,rr*.7,r.a,0,7);cx.fill()});cx.globalAlpha=1;return}
  const q=proj(p.a,p.r*1.4,d),R=q[2]*p.r*.5;
  if(p.ring){cx.strokeStyle='#e8d6a8aa';cx.lineWidth=R*.14;cx.beginPath();cx.ellipse(q[0],q[1],R*1.9,R*.45,-.3,Math.PI,0);cx.stroke()}
  ball(q[0],q[1],R,p.c);
  if(p.bands){cx.save();cx.beginPath();cx.arc(q[0],q[1],R,0,7);cx.clip();cx.globalAlpha=al*.35;['#b5774d','#fff','#b5774d','#c88f5e'].forEach((c,i)=>{cx.fillStyle=c;cx.fillRect(q[0]-R,q[1]-R*.7+i*R*.4,R*2,R*.12)});cx.restore()}
  if(p.ring){cx.globalAlpha=al;cx.strokeStyle='#e8d6a8cc';cx.lineWidth=R*.14;cx.beginPath();cx.ellipse(q[0],q[1],R*1.9,R*.45,-.3,0,Math.PI);cx.stroke()}
  cx.globalAlpha=1}
 // other players: a little ship with their name, waiting where their best flight ended. Fly past it and it falls behind you.
 function rival(r,i){const d=Z-at(r);if(d<.2||d>45)return;const q=proj(i*2.3+.9,1.2,d),k=Math.min(1.6,q[2]/F()*6),al=fadeIn(d)*Math.min(1,(45-d)/12);if(k<.08)return;
  cx.save();cx.globalAlpha=al;cx.translate(q[0],q[1]);cx.scale(k,k);cx.fillStyle='#9fb3d9';cx.fillRect(-58,-5,26,10);cx.fillRect(32,-5,26,10);
  cx.fillStyle='rgba(3,5,12,.82)';cx.strokeStyle=r.me?'#a5e7d8':'#ffe27a';cx.lineWidth=2;const tw=Math.max(64,r.name.length*7.5+20);cx.beginPath();cx.roundRect(-tw/2,-13,tw,26,9);cx.fill();cx.stroke();
  cx.fillStyle=r.me?'#a5e7d8':'#ffe27a';cx.font='800 11px system-ui';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(r.name,0,1);cx.restore()}
 function frame(t){requestAnimationFrame(frame);const dt=Math.min(.05,(t-last)/1000)||.016;last=t;
  // ease toward the goal distance: a burst of speed on every right answer, then a gentle cruise
  const gap=goal-Z;speed=reduced?gap*8:Math.max(gap*1.6,0);Z+=Math.min(gap,speed*dt);drift+=dt*(1.2+speed*.9);
  blast=Math.max(0,blast-dt);confetti=Math.max(0,confetti-dt);shake*=Math.exp(-dt*6);flare*=Math.exp(-dt*2);passedMsg=Math.max(0,passedMsg-dt);
  const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;cx.setTransform(dpr,0,0,dpr,sx*dpr,sy*dpr);
  const sky=Math.min(1,Z/12),g=cx.createRadialGradient(VP().x,VP().y,0,VP().x,VP().y,Math.max(w,h));g.addColorStop(0,`rgb(${Math.round(40-34*sky)},${Math.round(90-82*sky)},${Math.round(170-150*sky)})`);g.addColorStop(1,'#030915');cx.fillStyle=g;cx.fillRect(-20,-20,w+40,h+40);
  // stars stream in from the edges toward the point behind us, faster when the engines fire
  stars.forEach(s=>{let d=((drift-s.z)%40+40)%40;if(d<.3)return;const p=proj(s.a,s.r,d),q=proj(s.a,s.r,d-.12-speed*.05);cx.strokeStyle=`rgba(220,235,255,${fadeIn(d)*Math.min(1,(40-d)/10)*.9})`;cx.lineWidth=Math.max(.6,1.8/d);cx.beginPath();cx.moveTo(p[0],p[1]);cx.lineTo(q[0],q[1]);cx.stroke()});
  earth(t);
  [...planets].sort((a,b)=>a.at-b.at).forEach(planet);
  rivals.forEach(rival);
  if(flare>.02){cx.fillStyle=`rgba(255,220,160,${flare*.18})`;cx.fillRect(0,0,w,h)}
  if(blast){cx.fillStyle=`rgba(255,${Math.floor(60+blast*60)},30,${Math.min(.95,blast*.5)})`;cx.fillRect(0,0,w,h);const v=VP();for(let i=0;i<40;i++){const a=i*2.399,rr=(2.4-blast)*(30+i*5);cx.fillStyle=i%2?'#ffdf90':'#a2b2c5';cx.fillRect(v.x+Math.cos(a)*rr,v.y+Math.sin(a)*rr,5+i%7,4)}}
  if(confetti){cx.fillStyle='#ffe6a5';for(let i=0;i<65;i++){const x=(i*137.5)%w,y=((t/12+i*35)%h);cx.fillRect(x,y,3,7)}}
  label()}
 function label(){if(passedMsg)return;const v=Z/L,next=planets.find(p=>p.at*L>Z+.5),ahead=rivals.filter(r=>at(r)>Z+.5).sort((a,b)=>a.v-b.v)[0];
  const loc=[...planets].filter(p=>p.at*L<=Z+.5).at(-1);document.getElementById('location').textContent=loc?loc.n.toUpperCase()+' PASSAGE':'EARTH DEPARTURE';
  document.getElementById('orbitLabel').textContent=ahead?`Next to pass · ${ahead.name}`:next?(Z<1?'Earth falls away behind you.':'Next · '+next.n):'Beyond the solar system';}
 // a pilot sits just before the spot their best flight reached, so tying them flies you past and they fall behind
 const at=r=>Math.max(.5,r.v*L-6);
 function checkPassed(from,to){const p=rivals.filter(r=>at(r)>from+.01&&at(r)<=to+.01);if(!p.length)return;const el=document.getElementById('orbitLabel');el.textContent=`Passed ${p.map(r=>r.name).join(', ')}!`;passedMsg=3}
 requestAnimationFrame(frame);
 return {
  travel(v){const g=Math.max(0,Math.min(1.1,v))*L;checkPassed(goal,g);goal=g},
  boost(){flare=1;shake=reduced?0:3},
  impact(dead){blast=dead?2.4:.5;shake=reduced?0:(dead?22:12)},
  celebrate(){confetti=12;goal=1.1*L},
  rivals(list){rivals=(list||[]).filter(r=>r&&r.name&&r.v>0)},
  places(){return planets.map(p=>({n:p.n,at:p.at}))},
  reset(){goal=0;Z=0;blast=0;passedMsg=0;document.getElementById('location').textContent='EARTH DEPARTURE';document.getElementById('orbitLabel').textContent='Your next great leap.'}};
})();
