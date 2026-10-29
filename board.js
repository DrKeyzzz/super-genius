'use strict';
/* Online Music Theory Super Genius leaderboard (added 2026-10-22; privacy layout 2026-10-29).
   PRIVACY: a flight with a name is saved inside its class, so reading it needs the class code:
   classes/<active class code>/genius_scores/<code>_<sid> = the student's best flight
   { name, sid, class_code, correct (0-20), lives (0-3), ms (flight time), rank (ranks earned 0-3), updated_at }.
   Written only when a flight beats the student's best (the rules refuse anything that isn't better).
   The World board reads world_scores/genius/runs: only { nick ("First L."), level, score, created_at }, never a class code.
   score = right*40000 + lives*10000 + (9999 - seconds), so it sorts like right, then lives, then time;
   level = "17/20 2 lives 12:34 R2" (the readable detail). World runs are append-only: one per new best, the page keeps
   each pilot's best. No class = World copy only. Read only when the leaderboard opens or the launch screen needs pilots
   to pass; reads are cached for 10 minutes, so no new indexes and few reads. */
window.GeniusBoard=(()=>{
 const CFG={apiKey:'AIzaSyDU9vbCWJ4yWuD8bAX984DmQF4dvo13BHs',authDomain:'rhythm-trainer-fc313.firebaseapp.com',projectId:'rhythm-trainer-fc313',appId:'1:956677028482:web:c3ec72a279e61b6f6c929b'};
 const SDK='https://www.gstatic.com/firebasejs/10.12.2/',COL='genius_scores',WORLD='genius',TTL=600000;
 let fbP=null;
 function fb(){return fbP=fbP||Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-firestore.js')]).then(([a,fs])=>{const app=a.getApps().find(x=>x.name==='mtg-genius')||a.initializeApp(CFG,'mtg-genius');return{fs,db:fs.getFirestore(app)}}).catch(e=>{fbP=null;throw e})}
 const wait=p=>Promise.race([p,new Promise((_,bad)=>setTimeout(()=>bad(new Error('timeout')),15000))]);
 // the shared sign-in, exactly as the other games read it
 function who(){try{if(sessionStorage.getItem('music_guest')==='1')return null;const p=JSON.parse(localStorage.getItem('rdt_profile_v1')||'null');return p&&p.first&&p.init?p:null}catch{return null}}
 const sidOf=p=>(p.first+p.init).toLowerCase().replace(/[^a-z]/g,'');
 const nameOf=p=>`${p.first.charAt(0).toUpperCase()}${p.first.slice(1)} ${p.init}.`;
 function activeClass(p){const l=Array.isArray(p.classes)&&p.classes.length?p.classes:(p.classCode?[{code:p.classCode,name:p.className||p.classCode}]:[]);return l[0]||null}
 const better=(a,b)=>!b||a.correct>b.correct||(a.correct===b.correct&&(a.lives>b.lives||(a.lives===b.lives&&a.ms<b.ms)));
 const order=(a,b)=>b.correct-a.correct||b.lives-a.lives||a.ms-b.ms;
 // World copy: score sorts like right, then lives, then time; level is the readable detail (24 characters at most)
 const secsOf=ms=>Math.min(9999,Math.max(0,Math.round(ms/1000)));
 const scoreOf=b=>b.correct*40000+b.lives*10000+(9999-secsOf(b.ms));
 const levelOf=(b,rank)=>{const t=secsOf(b.ms);return`${b.correct}/20 ${b.lives} lives ${Math.floor(t/60)}:${String(t%60).padStart(2,'0')} R${rank}`};
 function fromWorld(d){const sc=Math.max(0,d.score|0),m=/^(\d+)\/20 (\d) lives (\d+):(\d\d) R(\d)$/.exec(d.level||'');
  return m?{correct:+m[1],lives:+m[2],ms:(+m[3]*60+ +m[4])*1000,rank:+m[5]}:{correct:Math.floor(sc/40000),lives:Math.floor(sc%40000/10000),ms:(9999-sc%10000)*1000,rank:0}}
 // a new best flight: send it (signed-in students only; guests never touch Firestore). One batch: the class copy + the World copy.
 async function submit(best,rank){const p=who();if(!p)return false;const sid=sidOf(p);if(!/^[a-z]{2,16}$/.test(sid))return false;const cls=activeClass(p);
  try{const{fs,db}=await fb(),batch=fs.writeBatch(db),b={correct:best.correct,lives:best.lives,ms:Math.round(best.ms)};
   if(cls)batch.set(fs.doc(db,'classes',cls.code,COL,cls.code+'_'+sid),{name:nameOf(p),sid,class_code:cls.code,...b,rank,updated_at:fs.serverTimestamp()});
   batch.set(fs.doc(fs.collection(db,'world_scores',WORLD,'runs')),{nick:nameOf(p),level:levelOf(b,rank),score:scoreOf(b),created_at:fs.serverTimestamp()});
   await wait(batch.commit());
   try{sessionStorage.removeItem('mtg_genius_board_v1:class');sessionStorage.removeItem('mtg_genius_board_v1:world')}catch{}return true}catch(e){console.warn('Super Genius board:',e.message);return false}}
 // rows for 'class' or 'world', newest copy at most 10 minutes old
 async function rows(kind){const p=who(),cls=p&&activeClass(p);if(kind==='class'&&!cls)return null;const ck='mtg_genius_board_v1:'+kind;
  try{const c=JSON.parse(sessionStorage.getItem(ck)||'null');if(c&&c.code===(cls?cls.code:'')&&Date.now()-c.t<TTL)return c.rows}catch{}
  const{fs,db}=await fb();let list;
  if(kind==='world'){const snap=await wait(fs.getDocs(fs.query(fs.collection(db,'world_scores',WORLD,'runs'),fs.orderBy('score','desc'),fs.limit(30))));
   const me=p?nameOf(p):null,seen=new Set();list=[];
   // append-only runs: keep each pilot's best (the first one, as they come best first); your own row gets your sid so it is highlighted
   snap.docs.map(d=>d.data()).forEach(d=>{const n=String(d.nick||'');if(!n||seen.has(n))return;seen.add(n);list.push({name:n,sid:n===me?sidOf(p):'',class_code:'',...fromWorld(d)})})}
  else{const snap=await wait(fs.getDocs(fs.query(fs.collection(db,'classes',cls.code,COL),fs.limit(100))));
   list=snap.docs.map(d=>d.data()).map(d=>({name:d.name,sid:d.sid,class_code:d.class_code,correct:d.correct|0,lives:d.lives|0,ms:d.ms|0,rank:d.rank|0}))}
  list.sort(order);if(kind==='world')list=list.slice(0,10);
  try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),code:cls?cls.code:'',rows:list}))}catch{}return list}
 return{who,sidOf,nameOf,activeClass,better,submit,rows};
})();
