/* Appended to frozen native game snapshots. Only this adapter knows their internals. */
(()=>{
 const engine=document.body.dataset.superEngine;let config=null,done=false,active=false,progress=0,total=0,errors=0;
 const send=(type,data={})=>parent.postMessage({superGenius:true,token:config?.token,type,...data},location.origin);
 function finish(ok,detail=''){if(done||!active)return;done=true;send('result',{ok:!!ok,detail});setTimeout(()=>window.superAudioStop(),1800)}
 // Sharp or Flat?: five questions, each closer than the last, no replays. A miss loses the challenge; five right clears it.
 const SF_STEPS=[[50,35,25,18,12],[30,20,14,10,7],[18,12,8,5,3]],SF_N=5;
 function sfLabel(){let el=document.getElementById('super-sf');if(!el){el=document.createElement('div');el.id='super-sf';el.style.cssText='position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483646;background:#07121fe6;border:1px solid #a5e7d8;color:#e8f6ff;border-radius:999px;padding:6px 16px;font:700 14px system-ui;letter-spacing:.04em;pointer-events:none';document.body.append(el)}
  const c=SF_STEPS[config.tier][Math.min(progress,SF_N-1)];el.textContent=`Question ${Math.min(progress+1,SF_N)} of ${SF_N} · ±${c} cents · no replays`}
 function atom(ok){if(done||!active)return;progress++;if(!ok)errors++;
  if(engine==='brainwaves'&&config.kind==='synapse'){if(!ok)finish(false,`Missed question ${progress} of ${SF_N} (±${SF_STEPS[config.tier][progress-1]} cents)`);else if(progress>=SF_N)finish(true,`${SF_N}/${SF_N} right, down to ±${SF_STEPS[config.tier][SF_N-1]} cents`);else setTimeout(()=>{if(done)return;sfLabel();S.phase='result';nextRound()},1300);return}
  if(engine==='tidal-tones'){if(!ok||progress>=config.count)finish(ok,`${progress-errors}/${progress} boats`)}else if(!['rooftop-runner','rhythm-trainer'].includes(engine))finish(ok);}
 // Existing game history callbacks provide the answer's native grading decision.
 if(typeof MTG_HIST!=='undefined')MTG_HIST.note=(game,labels,ok)=>atom(ok);
 const hide=sel=>document.querySelectorAll(sel).forEach(e=>e.style.setProperty('display','none','important'));
 hide('#mtg-feedback-btn,.mtg-feedback-wrap,.mtgfb-foot,.mtgfb-ov,header,.topbar,.mtg-home,#welcome,#assignBanner,.mtg-feedback,.mtg-time,#intro,.feedback-fab,#feedbackBtn');
 const sheet=document.createElement('style');sheet.textContent=`.mtgfb-foot,.mtgfb-ov{display:none!important}html,body{min-height:100%;margin:0}body{padding:0!important}a[href]{pointer-events:none}#super-gate{position:fixed;inset:0;z-index:2147483647;background:#07121feF;display:grid;place-content:center;text-align:center;padding:24px;color:#f0f6ff;font:16px system-ui}#super-gate h2{font-size:clamp(23px,4vw,42px);margin:8px 0}#super-gate p{max-width:600px;line-height:1.6;color:#bacbdc}#super-gate button{margin:18px auto;background:#b8eee2;color:#0b2729;font:700 16px system-ui;padding:14px 30px;border:0;border-radius:8px;cursor:pointer}#super-gate small{color:#b9a273}#super-gate button:focus-visible{outline:3px solid white;outline-offset:4px}`;document.head.append(sheet);
 const gate=document.createElement('div');gate.id='super-gate';document.body.append(gate);
 function scaleQuest(){
  // expert: only keys with 3 or more sharps or flats (majors, minors and modes), never C major, A minor or the easy keys
  const HARD=PLAY_ORDER.filter(k=>stdSig(k)&&Math.abs(sigCount(k))>=3);
  S.selected=new Set(config.tier===0?['G','F','D','Bb','A','Eb','C:nat','D:dor','F:lyd']:config.tier===1?PLAY_ORDER.filter(k=>Math.abs(sigCount(k))<=5):HARD);S.deg=false;S.ks=false;S.ksMix=false;S.muted=false;S.clef=config.clef||'treble';setClef(S.clef,false);
  startRun('practice');const r=S.run;let key=pick([...S.selected]),type=config.kind;
  advance=()=>{};hide('#quitBtn,.hud,#keySelect,#moreBox');
  if(type==='signature'){S.ks=true;r.ks=true;ksQuestion(pick(PLAY_ORDER.filter(k=>stdSig(k)&&Math.abs(sigCount(k))>=(config.tier===2?4:0))),config.variant||pick(['ksname','kscount','ksbuild']));return}
  if(type==='degree-name'){r.deg=true;
   // a hard key and never the tonic (Scale Quest's own picker starts on C major and can ask for degree 1)
   const k=pick([...S.selected]),d=2+Math.floor(Math.random()*6),answer=SCALES[k][d-1],t=pick(DEG_KINDS);
   r.q={key:k,type:t,degree:d,dn:true,dir:null,sk:k,name:scaleName(k),answer,tries:0,t0:Date.now()};
   if(t==='dstaff'){const c=[];for(let i=1;i<CL().max;i++)if(letterAt(i)===answer[0])c.push(i);r.q.pos=pick(c)}if(t==='dpiano')r.q.m=pick(keysOfPc(pcOf(answer)));
   renderQuestion();advance=()=>{};hide('#menuBtn,#homeBtn,#quitBtn,#timer,.hud,#qCount,#keySelect,#moreBox');return}
  const degree=2+Math.floor(Math.random()*6),sk=key;
  r.q={key,type,degree:type==='build'?null:degree,dir:typeOf(key)==='mel'?'up':null,sk,name:scaleName(key),answer:type==='build'?null:SCALES[sk][degree-1],tries:0,t0:Date.now()};renderQuestion();
  advance=()=>{};hide('#menuBtn,#homeBtn,#quitBtn,#timer,.hud,#qCount,#keySelect,#moreBox');
 }
 function tidal(){
  settings.game=config.kind==='intervals'?'intervals':'notes';settings.mode='practice';settings.clef=config.clef||'treble';settings.answer=config.kind==='piano'?'exact':'names';settings.ivl=['medium','hard','hard'][config.tier];settings.keys=config.tier===2?['A','E','B','Eb','Ab','Db']:['G','D','A','E','B','F','Bb','Eb','Ab','Db'];   // expert: 3 or more sharps or flatsapplyLevel(settings.game==='intervals'?['medium','hard','hard'][config.tier]:['medium','hard','expert'][config.tier]);
  document.body.dataset.view='game';startGame();game.keyOn=config.tier===2;game.key=pickKey();game.level=[3,6,10][config.tier];resize();hide('#pause-btn,#quit-btn,.hud');
  const rec=record;record=function(n,ok){rec(n,ok);if(done){game.running=false}};
 }
 function earshot(){
  // the cockpit shrinks the whole channel to fit, so Earshot's own zoom-to-window would fight it: keep the table at its natural size
  fitGame=()=>{const g=document.getElementById('game');if(g)g.style.zoom=1};fitGame();
  // in the cockpit the table must read at a glance: no wanted-poster wall, a smaller Clara/dealer, tighter rows (so it scales up, not down)
  const es=document.createElement('style');es.textContent='.wall{display:none!important}#dealer{width:96px!important;height:96px!important}.barrow{margin-top:0!important}.bubble{margin-bottom:6px!important;font-size:18px!important}.room{padding-bottom:8px!important}.tray{padding:8px 14px!important}.card.hole{width:168px!important}.card.hole .nm{font-size:17px!important}.card.hole .tag{font-size:12.5px!important}#game .stage{grid-template-columns:minmax(0,1fr)!important}#game .room,#game .tray,#game .piano{grid-column:1!important}.room{display:grid!important;grid-template-columns:minmax(150px,230px) minmax(0,1fr);align-items:center;gap:10px;background:var(--wood)!important}.barrow{grid-template-columns:1fr!important;grid-template-areas:"clock" "dealer" "bubble"!important;justify-items:center;align-self:center}.bubble{justify-self:center!important;margin:0!important}.bubble::before{display:none!important}.roundtable{margin:0!important;padding-top:14px!important;padding-bottom:16px!important;display:grid!important;grid-template-columns:auto auto;justify-content:center;grid-template-areas:"hole lbl" "hole cards" "hole time" "hole act";column-gap:30px;row-gap:8px;align-items:center}.holeWrap{grid-area:hole}#cards-lbl{grid-area:lbl}#cards{grid-area:cards;display:flex!important}.timetrack{grid-area:time}.actions{grid-area:act}';document.head.append(es);
  S.diff=['medium','hard','expert'][config.tier];S.clef=config.tier===2?'mixed':'treble';S.mode='trail';startRun();
  if(config.kind==='bluff')dealBluff();else if(config.kind==='noon'){S.handNo=7;S.noon=null;dealNoon()}else dealRegular();
  hide('#trail,.hud,#exit-btn,#menu-btn');
 }
 function brain(){
  S.region=REGIONS.findIndex(r=>r.id===config.kind);S.sel=0;S.mode='run';S.floor=Math.min(LV().length-1,config.level);S.inFloor=0;S.rounds=0;S.correct=0;S.lives=3;S.score=0;S.streak=0;S.bestStreak=0;S.run={ptsMax:0};
  S.busy=false;gameLook();setFloorUI();hudUI();show('game');
  if(config.kind==='synapse'){centsFor=()=>SF_STEPS[config.tier][Math.min(progress,SF_N-1)];replay=()=>{};hide('#b-again,#sr-rep');sfLabel()}
  nextRound(true);hide('.hud,#b-exit,#b-cnext,#b-next');
 }
 function bigScore(){
  S.mode='practice';S.started=true;S.settings.mission=config.kind==='melody'?'melody':'rhythm';S.settings.level=['easy','hard','extreme'][config.tier];S.settings.measures=2;   // two bars, like Rooftop, so the flight stays shortS.settings.type='mixed';
  if(config.kind==='melody'){
   S.settings.mel.level=['five','vault','master'][config.tier];S.settings.mel.mode='both';S.settings.mel.showRhythm=false;setApp('melody');melNew();
   const check=melCheck;melCheck=function(){const before=S.mel.checked;check();if(!before&&S.mel.checked){const g=melGrade(S.mel.q,S.mel.ans);finish(g.pc===g.n&&g.rc===g.n,`${g.pc}/${g.n} pitches · ${g.rc}/${g.n} rhythms`)}};
  }else{
   S.app='rhythm';showView('play');loadQuestion(generateRhythm(['4/4','6/8','9/8','12/8'][rand(4)],S.settings.measures,null,S.settings.level));
   const check=onCheck;onCheck=function(){const before=S.checked;check();if(!before&&S.checked)finish(S.answer.every((id,i)=>id===S.q.cells[i]),`${S.answer.filter((id,i)=>id===S.q.cells[i]).length}/${S.answer.length} rhythm cells`)};
  }
  // 4 listens per dictation (the key-setting chords never count); the button shows how many are left
  const LISTENS=4;let listens=0;const isChecked=()=>config.kind==='melody'?S.mel.checked:S.checked;
  const listenUI=()=>{const left=LISTENS-listens,b=els.playsBadge;if(isChecked())return;b.hidden=false;b.textContent=left;els.playQBtn.disabled=left<=0;els.playQBtn.title=left>0?`${left} of ${LISTENS} listens left`:'No listens left'};
  const listen=()=>{if(isChecked())return true;if(listens>=LISTENS){toast('No listens left. Finish it from memory.');return false}listens++;setTimeout(listenUI);return true};
  const pq=playQuestion;playQuestion=function(){if(listen())pq()};const mp=melPlay;melPlay=function(who){if(who!=='question'||listen())mp(who)};setInterval(listenUI,500);
  updateUI();fitScreen(true);hide('#setup,#ready,#appTabs,#challengeBtn,#moreBtn,#mwBtn,#teacherBtn,#whoBtn,#agentStrip,.agent-id,.spy-status,#reportBtn');const line=document.getElementById('statsLine');if(line)line.parentElement.style.display='none';requestAnimationFrame(()=>{fitScreen(true);if(innerWidth>700)setZoom(Math.min(zoomNow,.8));window.scrollTo(0,0)});
 }
 function rooftop(){
  const cfg={style:config.kind==='rhythm'?'rhythm':'keys',diff:['medium','hard','expert'][config.tier],clef:config.clef||'treble',mode:'practice',practiceBpm:[64,64,64][config.tier]};lastConfig=cfg;document.body.dataset.view='game';startGame(cfg);G.warmLeft=0;G.heardCheck=true;G.gotInput=true;
  const monitor=setInterval(()=>{if(done){clearInterval(monitor);G.running=false;return}if(!active)return;const st=G.stats;const segment=G.attacks.filter(a=>a.b>=0&&a.b<8),end=Math.max(8,...segment.map(a=>a.b+a.len));if(G.t>=end+.35){for(const a of segment){if(!a.h&&a.pressAt!=null)finishHold(a,end)}const hits=segment.filter(a=>a.j&&a.j!=='M'&&a.j!=='W'&&a.h!=='early').length;const accuracy=hits/Math.max(1,segment.length+st.extra);finish(hits>0&&accuracy>=[.8,.9,.95][config.tier],`${Math.round(accuracy*100)}% over two bars · ${hits}/${segment.length} notes held correctly`);G.running=false}},50);
  hide('.hud,#pause-btn,#quit-btn,#loop-btn,#menu-btn');
 }
 const starts={'scale-quest':scaleQuest,'tidal-tones':tidal,'earshot-saloon':earshot,'brainwaves':brain,'rhythm-trainer':bigScore,'rooftop-runner':rooftop};
 addEventListener('message',e=>{if(e.source!==parent||e.origin!==location.origin||!e.data?.configureSuper||config)return;config=e.data.config;
 gate.innerHTML='<small>CHANNEL '+String(config.number).padStart(2,'0')+'</small><h2></h2><p></p><button>Begin challenge →</button>';gate.querySelector('h2').textContent=config.title;gate.querySelector('p').textContent=config.instructions;
 gate.querySelector('button').onclick=()=>{active=true;gate.remove();try{starts[engine]();send('started');dispatchEvent(new Event('super-check-start'))}catch(err){send('error',{message:err.message});console.error(err)}};send('ready');
 });
 if(new URLSearchParams(location.search).has('component-check')){const check=document.createElement('script');check.src='../tests/native-check.js';check.onload=()=>send('boot');document.body.append(check)}else send('boot');
})();
