'use strict';
(()=>{
 const {catalog,tiers,deck,config}=GeniusCatalog,$=id=>document.getElementById(id);
 const key='mtg_super_genius_v1';let saved;try{saved=JSON.parse(localStorage.getItem(key)||'null')}catch{}saved=saved&&saved.version===1?saved:{version:1,unlocked:0,earned:[],best:[],flight:null};
 // ?unlock=all opens every tier (for trying the top tier; gate this to teachers or remove it before publishing)
 try{if(new URLSearchParams(location.search).get('unlock')==='all')saved.unlocked=2}catch{}
 let selected=0,run=null,frame=null,current=null,token='',settled=false,bootTimer=null,loaded=false,feedbackTimer=null;
 function persist(){try{localStorage.setItem(key,JSON.stringify(saved))}catch{$('liveStatus').textContent='Storage unavailable · keep this tab open'}}
 function show(id){['lobby','channelHost','switching','feedback','finish','board'].forEach(x=>$(x).hidden=x!==id);document.body.classList.toggle('playing',id==='channelHost'||id==='switching');if(id==='channelHost')fitSoon()}
 // NO SCROLLING: the game inside the monitor is drawn on a bigger virtual screen and shrunk to fit, so every channel fits whole.
 // The shrink is a CSS transform on the frame, so clicks, taps and canvases inside keep working normally.
 let fitK=1,fitWide=true,fitGrown=false,fitTx=0,fitTy=0,fitTimer=null;
 // Each channel is fitted to the monitor. Too big: shrink it. "Wide" lays the game out on a wider virtual screen (best for
 // ordinary pages); if the game grows taller as it gets wider (a table that keeps its shape), keep the real width instead.
 // Too small (a card floating in empty space): grow it once, up to 1.45x. Either way the content sits centred in the monitor.
 function need(){const d=frame.contentDocument,w=frame.contentWindow,se=d.scrollingElement||d.documentElement;let h=Math.max(se.scrollHeight,d.body?d.body.scrollHeight:0),wd=se.scrollWidth;
  // some games never scroll, they just clip what doesn't fit: also count where the visible controls and text are
  const ih=w.innerHeight,box={t:1e9,l:1e9,b:0,r:0};for(const e of d.querySelectorAll('button,select,input,canvas,svg,[role=button],h1,h2,h3,p,label')){if(e.closest('[hidden]'))continue;const b=e.getBoundingClientRect();if(b.width<3||b.height<3||b.height>=ih*.9||b.bottom>ih*3||b.top<-ih)continue;   // skip full-screen backdrops
   const cs=w.getComputedStyle(e);if(cs.visibility==='hidden'||+cs.opacity===0)continue;h=Math.max(h,b.bottom+6);wd=Math.max(wd,b.right);box.t=Math.min(box.t,b.top);box.l=Math.min(box.l,b.left);box.b=Math.max(box.b,b.bottom);box.r=Math.max(box.r,b.right)}
  return[h,wd,box]}
 function apply(W,H){const vw=fitWide?W/fitK:W;frame.style.width=vw+'px';frame.style.height=(H/fitK)+'px';
  frame.style.transform=`translate(${(fitWide?0:(W-W*fitK)/2)+fitTx}px,${fitTy}px) scale(${fitK})`}
 function fit(){if(!frame||!frame.contentDocument)return;const host=$('channelHost'),W=host.clientWidth,H=host.clientHeight;if(!W||!H)return;
  for(let i=0;i<5;i++){const[h,w,box]=need(),vh=H/fitK,vw=fitWide?W/fitK:W;
   if(h<=vh+1&&w<=vw+1){
    if(box.b<=box.t)return;const bh=box.b-box.t,bw=box.r-box.l;
    if(!fitGrown&&bh<vh*.78&&bw<vw*.85){fitGrown=true;fitK=Math.min(1.45,fitK*Math.min(vh*.9/bh,vw*.92/bw));fitTx=fitTy=0;apply(W,H);continue}
    // centre what is on screen, never pushing any of it off the edge
    const k=fitK,x0=fitWide?0:(W-W*k)/2,cy=H/2-(box.t+box.b)/2*k,cx=W/2-(box.l+box.r)/2*k-x0;
    const ty=Math.max(-box.t*k+4,Math.min(H-box.b*k-4,cy)),tx=Math.max(-box.l*k-x0+4,Math.min(W-box.r*k-x0-4,cx));
    if(Math.abs(ty-fitTy)>4||Math.abs(tx-fitTx)>4){fitTy=Math.max(0,ty);fitTx=fitWide?Math.max(0,tx):0;apply(W,H)}return}
   if(fitK>1){fitK=1;fitTx=fitTy=0;apply(W,H);continue}   // growing made it overflow (the game resizes itself to the window): stay at normal size
   const k=fitK*Math.min(vh/h,vw/w);fitTx=fitTy=0;if(fitWide&&k<.62){fitWide=false;fitK=1;apply(W,H);continue}fitK=Math.max(.4,k-.002);apply(W,H)}}
 function fitSoon(){clearInterval(fitTimer);fitK=1;fitWide=true;fitGrown=false;fitTx=fitTy=0;if(frame){frame.style.transform='';frame.style.width='';frame.style.height=''}fitTimer=setInterval(fit,400)}   // keeps watching the whole challenge: a result panel or new row that appears late also gets fitted
 addEventListener('resize',()=>{if(frame&&!$('channelHost').hidden)fitSoon()});
 function removeFrame(){clearTimeout(bootTimer);clearInterval(fitTimer);if(frame){frame.remove();frame=null}clearTimeout(feedbackTimer)}
 function renderTiers(){ $('tiers').replaceChildren();tiers.forEach((t,i)=>{const b=document.createElement('button');b.className='tier'+(i>saved.unlocked?' locked':'');b.setAttribute('aria-pressed',String(i===selected));b.disabled=i>saved.unlocked;b.innerHTML=`<small>TIER 0${i+1} ${saved.earned[i]?'· EARNED':i>saved.unlocked?'· LOCKED':''}</small><b>${t.name}</b><small>${t.tag}</small>`;b.onclick=()=>{selected=i;renderTiers()};$('tiers').append(b)});$('launch').textContent=saved.flight?'Resume saved flight →':'Launch flight →';$('launchNote').textContent=saved.flight?`${tiers[saved.flight.tier].name} · ${saved.flight.index}/${catalog.length} attempted · ${saved.flight.lives} lives`:catalog.length+' challenges · 3 lives · no overall clock'}
 function sync(){if(!run)return;document.body.dataset.damage=3-run.lives;HullFX.setDamage(3-run.lives);$('rank').textContent=tiers[run.tier].name.toUpperCase();$('tierStatus').textContent=`TIER 0${run.tier+1} / ${tiers[run.tier].name.toUpperCase()}`;$('hull').textContent=`HULL ${Math.round(run.lives/3*100)}% ${'● '.repeat(run.lives)}${'○ '.repeat(3-run.lives)}`;$('progress').textContent=run.lab?'FLIGHT LAB · NO RANKING':`${Math.min(run.index+1,run.order.length)} / ${run.order.length} · ${run.correct} CORRECT`;$('quit').hidden=false;SpaceFlight.travel(run.lab?catalog.findIndex(c=>c.id===run.order[0])/catalog.length:(run.tier+run.correct/catalog.length)/3)}
 // Other pilots to pass, placed where their best flight ended (v: 0..1 across all three tiers).
 // SAMPLE pilots for the local build only; the online Music Theory Super Genius board replaces them before publishing.
 const SAMPLE_PILOTS=[['MAYA R.',2],['JAYDEN K.',5],['ZOE P.',9],['LIAM T.',14],['ARIA S.',19],['NOAH B.',26],['EVA M.',33],['KAI D.',41],['LUNA G.',50],['OMAR F.',58]];
 function rivals(){const n=catalog.length*3,list=SAMPLE_PILOTS.map(([name,c])=>({name,v:c/n}));saved.best.forEach((b,i)=>{if(b)list.push({name:'YOUR BEST',v:(i+b.correct/catalog.length)/3,me:true})});return list}
 function saveFlight(){if(!run||run.lab)return;saved.flight={...run};persist()}
 function begin(lab=false){removeFrame();if(lab){const tier=Number($('labTier').value);run={tier,index:0,lives:3,correct:0,order:[$('labChannel').value],lab:true,started:Date.now()}}else if(saved.flight){run={...saved.flight}}else{run={tier:selected,index:0,lives:3,correct:0,order:deck().map(c=>c.id),lab:false,started:Date.now()}}if(run.lives===0||run.index>=run.order.length){finish();return}loadChannel()}
 function loadChannel(){removeFrame();settled=false;loaded=false;current=catalog.find(c=>c.id===run.order[run.index]);token=crypto.randomUUID();sync();saveFlight();show('switching');$('channelName').textContent=current.name.toUpperCase();$('switchTitle').textContent=current.name;$('switchDetail').textContent=current.label+' · '+tiers[run.tier].name;
  frame=document.createElement('iframe');frame.title=current.name+' · '+current.label;frame.setAttribute('allow','autoplay');frame.src='channels/'+current.engine+'.html?v=2';$('channelHost').replaceChildren(frame);
  // The native page must boot and acknowledge configuration before the monitor opens.
  bootTimer=setTimeout(()=>channelError('This channel did not load. Reload it to continue; no life has been lost.'),14000);
 }
 function channelError(message){if(settled)return;settled=true;clearTimeout(bootTimer);show('feedback');$('verdict').textContent='SIGNAL INTERRUPTED';$('resultTitle').textContent='Let’s reconnect.';$('resultText').textContent=message;$('resultDetail').textContent='Your flight is saved.';$('next').hidden=true;$('retryChannel').hidden=false}
 function receive(e){if(!frame||e.source!==frame.contentWindow||e.origin!==location.origin||!e.data?.superGenius)return;const d=e.data;
  if(d.type==='boot'){frame.contentWindow.postMessage({configureSuper:true,config:config(current,run.tier,token)},location.origin);return}if(d.token!==token)return;
  if(d.type==='ready'){clearTimeout(bootTimer);loaded=true;setTimeout(()=>{if(!settled&&frame){show('channelHost');frame.focus()}},450)}
  if(d.type==='started'){$('liveStatus').textContent=current.game==='score'?'FULL DICTATION · SUBMIT WHEN READY':'CHALLENGE IN PROGRESS'}
  if(d.type==='error')channelError('The channel could not start: '+d.message);
  if(d.type==='result'&&loaded&&!settled)result(d.ok,d.detail);
 }
 function result(ok,detail){settled=true;clearTimeout(bootTimer);if(!run.lab)(run.log||(run.log=[])).push({id:run.order[run.index],ok});if(ok){run.correct++;SpaceFlight.boost()}else{run.lives--;document.body.classList.add('hit');setTimeout(()=>document.body.classList.remove('hit'),500);SpaceFlight.impact(run.lives===0);HullFX.hit(run.lives===0)}run.index++;sync();saveFlight();
  // the third mistake: the ship burns up in the atmosphere, then END OF LINE (no feedback screen in between)
  if(!ok&&!run.lives&&!run.lab){$('liveStatus').textContent='HULL FAILURE';HullFX.burn(finish);return}
  
  feedbackTimer=setTimeout(()=>{removeFrame();show('feedback');$('retryChannel').hidden=true;$('next').hidden=false;$('verdict').textContent=ok?'SIGNAL CLEARED':'HULL IMPACT';$('resultTitle').textContent=ok?'That’s genius.':run.lives?'Keep your nerve.':'Hull failure.';$('resultText').textContent=ok?current.label+' complete.':run.lives?`${run.lives} ${run.lives===1?'life':'lives'} remaining. The next channel is waiting.`:'Three mistakes. Your flight ends here.';$('resultDetail').textContent=detail||'';$('next').textContent=run.lab?'Return to flight lab →':run.lives===0?'Flight report →':run.index>=run.order.length?'Claim your rank →':'Next channel →';$('next').focus()},ok?1900:run.lives?2100:2900);
 }
 function finish(){removeFrame();if(run.lab){home();return}const won=run.lives>0&&run.index===run.order.length;saved.flight=null;const best=saved.best[run.tier];run.prevBest=best?best.correct:null;if(!best||run.correct>best.correct||(run.correct===best.correct&&run.lives>best.lives))saved.best[run.tier]={correct:run.correct,lives:run.lives,attempted:run.index,at:new Date().toISOString(),won};
  if(won){saved.earned[run.tier]=true;saved.unlocked=Math.max(saved.unlocked,Math.min(2,run.tier+1));selected=Math.min(2,run.tier+1)}persist();show('finish');$('quit').hidden=true;$('finish').className='screen finish '+(won?'epic':'fail');$('medal').textContent=won?'✦':'✧';$('finishLabel').textContent=won?'RANK EARNED':'FLIGHT ENDED';$('finishTitle').textContent=won?tiers[run.tier].name:'You’ll fly again.';$('finishText').textContent=won?(run.tier===2?'Every channel. Every discipline. You earned the highest rank in the fleet.':`${run.correct}/${catalog.length} correct. ${tiers[run.tier+1].name} is now unlocked.`):`${run.correct} correct across ${run.index} challenges. Review your games and launch another flight.`;$('liveStatus').textContent='RECORD SAVED ON THIS DEVICE';if(won)SpaceFlight.celebrate();else endOfLine();$('again').focus()
 }
 // END OF LINE: the black screen after the ship burns up, with how far this flight got
 function endOfLine(){const n=run.order.length,v=(run.tier+run.correct/catalog.length)/3,places=SpaceFlight.places(),log=run.log||[],el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
  const reached=places.filter(p=>p.at<=v).at(-1);$('eolWhy').textContent=`Your ship burned up on challenge ${run.index} of ${n}.`;
  $('eolFar').textContent=reached?`You made it past ${reached.n==='Asteroid belt'?'the Asteroid belt':reached.n==='Beyond'?'Pluto':reached.n==='Moon'?'the Moon':reached.n}`:'You cleared Earth’s atmosphere';
  // the route: Earth, then each planet; the lit part is how far this flight went, the white tick is your best
  const track=$('eolTrack');track.replaceChildren();const stops=[{n:'Earth',at:0},...places.map(p=>({n:p.n==='Asteroid belt'?'Asteroids':p.n==='Beyond'?'Pluto':p.n,at:p.at}))];
  const line=el('div','eol-line'),fill=el('div','eol-fill');fill.style.width=(v*100).toFixed(1)+'%';line.append(fill);
  if(run.prevBest!=null){const bv=(run.tier+run.prevBest/catalog.length)/3,tick=el('div','eol-best');tick.style.left=(bv*100).toFixed(1)+'%';tick.title='Your best';line.append(tick)}
  const ship=el('div','eol-ship','🚀');ship.style.left=(v*100).toFixed(1)+'%';line.append(ship);
  stops.forEach(p=>{const s=el('div','eol-stop'+(p.at<=v?' on':''));s.style.left=(p.at*100).toFixed(1)+'%';s.append(el('i'),el('span','',p.n));line.append(s)});track.append(line);
  const toGo=n-run.correct,next=run.tier<2?tiers[run.tier+1].name:'the top rank',pb=run.prevBest,frac=run.correct/n;
  $('eolSay').textContent=(pb==null?'Your first flight on this tier is on the board. ':run.correct>pb?`New personal best! ${run.correct-pb} farther than before. `:run.correct===pb?'You tied your best. ':`Your best is ${pb}. Just ${pb-run.correct} short of it. `)
   +(frac<.25?'Every pilot burns up on the early flights. Each launch takes you farther.':frac<.5?'Solid start. Fix the weak spots below and you will pass this point.':frac<.75?'Over halfway. You have the skills; now it is about steady nerves.':`So close! ${toGo} more and ${run.tier<2?next+' unlocks':'you earn the top rank'}.`);
  $('eolStats').replaceChildren();const row=(k,x)=>{$('eolStats').append(el('dt','',k),el('dd','',x))};
  row('Rank',tiers[run.tier].name);row('Cleared',`${run.correct} of ${n}`);row('Flight time',(m=>`${Math.floor(m/60)}:${String(m%60).padStart(2,'0')}`)(Math.round((Date.now()-run.started)/1000)));
  // feedback: games with no misses, and the challenges that cost a life with a link to practise them
  const fb=$('eolFeedback');fb.replaceChildren();const item=id=>catalog.find(c=>c.id===id),games={};
  log.forEach(r=>{const c=item(r.id);if(!c)return;const g=games[c.name]||(games[c.name]={ok:0,miss:0});r.ok?g.ok++:g.miss++});
  const strong=Object.entries(games).filter(([,g])=>g.ok&&!g.miss).map(([k])=>k),misses=log.filter(r=>!r.ok).map(r=>item(r.id)).filter(Boolean);
  if(strong.length){const b=el('div','eol-box good');b.append(el('h3','','Strong'),el('p','',strong.join(' · ')));fb.append(b)}
  if(misses.length){const b=el('div','eol-box work'),ul=el('ul');b.append(el('h3','','Practice these'));misses.forEach(c=>{const li=el('li'),a=el('a','',`Practice in ${c.name} →`);a.href=`../${c.engine}/`;li.append(el('b','',c.label),a);ul.append(li)});b.append(ul);fb.append(b)}
  $('eol').hidden=false;$('eolAgain').focus()}
 function home(){removeFrame();$('eol').hidden=true;HullFX.reset();run=null;show('lobby');$('quit').hidden=true;$('channelName').textContent='MISSION CONTROL';$('progress').textContent='ONE FLIGHT · EVERY SKILL';$('liveStatus').textContent='LOCAL BUILD · UNPUBLISHED';$('tierStatus').textContent='SYSTEMS READY';document.body.dataset.damage='0';$('hull').textContent='HULL 100% ● ● ●';$('rank').textContent='FLIGHT DECK 09';SpaceFlight.reset();SpaceFlight.rivals(rivals());renderTiers()}
 $('launch').onclick=()=>begin();$('labLaunch').onclick=()=>begin(true);$('next').onclick=()=>{if(run.lab||run.lives===0||run.index>=run.order.length)finish();else loadChannel()};$('retryChannel').onclick=loadChannel;$('again').onclick=home;$('eolHome').onclick=home;$('eolAgain').onclick=()=>{const t=run?run.tier:selected;home();selected=t;renderTiers();begin()};
 $('quit').onclick=()=>{if(!run)return;removeFrame();if(!run.lab){saved.flight=null;persist()}home()};
 $('boardBtn').onclick=()=>{if(run)return;show('board');$('records').replaceChildren();tiers.forEach((t,i)=>{const a=document.createElement('article'),b=document.createElement('b'),s=document.createElement('span');b.textContent=t.name;const rec=saved.best[i];s.textContent=rec?`${rec.correct}/${catalog.length} correct · ${rec.won?'Rank earned':'Flight ended'} · ${new Date(rec.at).toLocaleDateString()}`:'No flight yet';a.append(b,s);$('records').append(a)})};$('boardBack').onclick=home;
 tiers.forEach((t,i)=>{const o=new Option(t.name,String(i));$('labTier').add(o)});catalog.forEach(c=>$('labChannel').add(new Option(c.name+' · '+c.label,c.id)));
 addEventListener('message',receive);addEventListener('pagehide',saveFlight);home();if(location.hash==='#leaderboard')$('boardBtn').click();   // the home page's red Leaderboard button opens straight to the board
})();
