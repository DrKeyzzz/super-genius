/* Appended to frozen native game snapshots. Only this adapter knows their internals. */
(()=>{
 const engine=document.body.dataset.superEngine;let config=null,done=false,active=false,progress=0,total=0,errors=0;
 const send=(type,data={})=>parent.postMessage({superGenius:true,token:config?.token,type,...data},location.origin);
 function finish(ok,detail=''){if(done||!active)return;done=true;send('result',{ok:!!ok,detail});setTimeout(()=>window.superAudioStop(),1800)}
 function atom(ok){if(done||!active)return;progress++;if(!ok)errors++;if(engine==='tidal-tones'){if(!ok||progress>=config.count)finish(ok,`${progress-errors}/${progress} boats`)}else if(!['rooftop-runner','rhythm-trainer'].includes(engine))finish(ok);}
 // Existing game history callbacks provide the answer's native grading decision.
 if(typeof MTG_HIST!=='undefined')MTG_HIST.note=(game,labels,ok)=>atom(ok);
 const hide=sel=>document.querySelectorAll(sel).forEach(e=>e.style.setProperty('display','none','important'));
 hide('#mtg-feedback-btn,.mtg-feedback-wrap,.mtgfb-foot,.mtgfb-ov,header,.topbar,.mtg-home,#welcome,#assignBanner,.mtg-feedback,.mtg-time,#intro,.feedback-fab,#feedbackBtn');
 const sheet=document.createElement('style');sheet.textContent=`.mtgfb-foot,.mtgfb-ov{display:none!important}html,body{min-height:100%;margin:0}body{padding:0!important}a[href]{pointer-events:none}#super-gate{position:fixed;inset:0;z-index:2147483647;background:#07121feF;display:grid;place-content:center;text-align:center;padding:24px;color:#f0f6ff;font:16px system-ui}#super-gate h2{font-size:clamp(23px,4vw,42px);margin:8px 0}#super-gate p{max-width:600px;line-height:1.6;color:#bacbdc}#super-gate button{margin:18px auto;background:#b8eee2;color:#0b2729;font:700 16px system-ui;padding:14px 30px;border:0;border-radius:8px;cursor:pointer}#super-gate small{color:#b9a273}#super-gate button:focus-visible{outline:3px solid white;outline-offset:4px}`;document.head.append(sheet);
 const gate=document.createElement('div');gate.id='super-gate';document.body.append(gate);
 function scaleQuest(){
  S.selected=new Set(config.tier===0?['G','F','D','Bb','A','Eb','C:nat','D:dor','F:lyd']:config.tier===1?PLAY_ORDER.filter(k=>Math.abs(sigCount(k))<=5):PLAY_ORDER);S.deg=false;S.ks=false;S.ksMix=false;S.muted=false;S.clef=config.clef||'treble';setClef(S.clef,false);
  startRun('practice');const r=S.run;let key=pick([...S.selected]),type=config.kind;
  advance=()=>{};hide('#quitBtn,.hud,#keySelect,#moreBox');
  if(type==='signature'){S.ks=true;r.ks=true;ksQuestion(pick(PLAY_ORDER.filter(stdSig)),config.variant||pick(['ksname','kscount','ksbuild']));return}
  if(type==='degree-name'){r.deg=true;degQuestion();return}
  const degree=2+Math.floor(Math.random()*6),sk=key;
  r.q={key,type,degree:type==='build'?null:degree,dir:typeOf(key)==='mel'?'up':null,sk,name:scaleName(key),answer:type==='build'?null:SCALES[sk][degree-1],tries:0,t0:Date.now()};renderQuestion();
  advance=()=>{};hide('#menuBtn,#homeBtn,#quitBtn,#timer,.hud,#qCount,#keySelect,#moreBox');
 }
 function tidal(){
  settings.game=config.kind==='intervals'?'intervals':'notes';settings.mode='practice';settings.clef=config.clef||'treble';settings.answer=config.kind==='piano'?'exact':'names';settings.ivl=['medium','hard','hard'][config.tier];settings.keys=['G','D','A','E','B','F','Bb','Eb','Ab','Db'];applyLevel(settings.game==='intervals'?['medium','hard','hard'][config.tier]:['medium','hard','expert'][config.tier]);
  document.body.dataset.view='game';startGame();game.keyOn=config.tier===2;game.key=pickKey();game.level=[3,6,10][config.tier];resize();hide('#pause-btn,#quit-btn,.hud');
  const rec=record;record=function(n,ok){rec(n,ok);if(done){game.running=false}};
 }
 function earshot(){
  S.diff=['medium','hard','expert'][config.tier];S.clef=config.tier===2?'mixed':'treble';S.mode='trail';startRun();
  if(config.kind==='bluff')dealBluff();else if(config.kind==='noon'){S.handNo=7;S.noon=null;dealNoon()}else dealRegular();
  hide('#trail,.hud,#exit-btn,#menu-btn');
 }
 function brain(){
  S.region=REGIONS.findIndex(r=>r.id===config.kind);S.sel=0;S.mode='run';S.floor=Math.min(LV().length-1,config.level);S.inFloor=0;S.rounds=0;S.correct=0;S.lives=3;S.score=0;S.streak=0;S.bestStreak=0;S.run={ptsMax:0};
  S.busy=false;gameLook();setFloorUI();hudUI();show('game');nextRound(true);hide('.hud,#b-exit,#b-cnext,#b-next');
 }
 function bigScore(){
  S.mode='practice';S.started=true;S.settings.mission=config.kind==='melody'?'melody':'rhythm';S.settings.level=['easy','hard','extreme'][config.tier];S.settings.measures=config.tier===0?2:4;S.settings.type='mixed';
  if(config.kind==='melody'){
   S.settings.mel.level=['five','vault','master'][config.tier];S.settings.mel.mode='both';S.settings.mel.showRhythm=false;setApp('melody');melNew();
   const check=melCheck;melCheck=function(){const before=S.mel.checked;check();if(!before&&S.mel.checked){const g=melGrade(S.mel.q,S.mel.ans);finish(g.pc===g.n&&g.rc===g.n,`${g.pc}/${g.n} pitches · ${g.rc}/${g.n} rhythms`)}};
  }else{
   S.app='rhythm';showView('play');loadQuestion(generateRhythm(['4/4','6/8','9/8','12/8'][rand(4)],S.settings.measures,null,S.settings.level));
   const check=onCheck;onCheck=function(){const before=S.checked;check();if(!before&&S.checked)finish(S.answer.every((id,i)=>id===S.q.cells[i]),`${S.answer.filter((id,i)=>id===S.q.cells[i]).length}/${S.answer.length} rhythm cells`)};
  }
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
