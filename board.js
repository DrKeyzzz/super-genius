'use strict';
/* Online Music Theory Super Genius leaderboard (added 2026-10-22).
   One document per student per class: genius_scores/<active class code or 'none'>_<sid> = the student's best flight
   { name, sid, class_code, correct (0-20), lives (0-3), ms (flight time), rank (ranks earned 0-3), updated_at }.
   Written only when a flight beats the student's best (the rules refuse anything that isn't better). Read only when
   the leaderboard opens or the launch screen needs pilots to pass: My class (where class_code ==, sorted here) and
   World top 10 (orderBy correct, sorted here for ties). Reads are cached for 10 minutes, so no new indexes and few reads. */
window.GeniusBoard=(()=>{
 const CFG={apiKey:'AIzaSyDU9vbCWJ4yWuD8bAX984DmQF4dvo13BHs',authDomain:'rhythm-trainer-fc313.firebaseapp.com',projectId:'rhythm-trainer-fc313',appId:'1:956677028482:web:c3ec72a279e61b6f6c929b'};
 const SDK='https://www.gstatic.com/firebasejs/10.12.2/',COL='genius_scores',TTL=600000;
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
 // a new best flight: send it (signed-in students only; guests never touch Firestore)
 async function submit(best,rank){const p=who();if(!p)return false;const sid=sidOf(p);if(!/^[a-z]{2,16}$/.test(sid))return false;const cls=activeClass(p);
  try{const{fs,db}=await fb();await wait(fs.setDoc(fs.doc(db,COL,(cls?cls.code:'none')+'_'+sid),{name:nameOf(p),sid,class_code:cls?cls.code:'',correct:best.correct,lives:best.lives,ms:Math.round(best.ms),rank,updated_at:fs.serverTimestamp()}));
   try{sessionStorage.removeItem('mtg_genius_board_v1:class');sessionStorage.removeItem('mtg_genius_board_v1:world')}catch{}return true}catch(e){console.warn('Super Genius board:',e.message);return false}}
 // rows for 'class' or 'world', newest copy at most 10 minutes old
 async function rows(kind){const p=who(),cls=p&&activeClass(p);if(kind==='class'&&!cls)return null;const ck='mtg_genius_board_v1:'+kind;
  try{const c=JSON.parse(sessionStorage.getItem(ck)||'null');if(c&&c.code===(cls?cls.code:'')&&Date.now()-c.t<TTL)return c.rows}catch{}
  const{fs,db}=await fb(),col=fs.collection(db,COL);
  const q=kind==='world'?fs.query(col,fs.orderBy('correct','desc'),fs.limit(30)):fs.query(col,fs.where('class_code','==',cls.code),fs.limit(100));
  const snap=await wait(fs.getDocs(q));let list=snap.docs.map(d=>d.data()).map(d=>({name:d.name,sid:d.sid,class_code:d.class_code,correct:d.correct|0,lives:d.lives|0,ms:d.ms|0,rank:d.rank|0}));
  list.sort(order);if(kind==='world')list=list.slice(0,10);
  try{sessionStorage.setItem(ck,JSON.stringify({t:Date.now(),code:cls?cls.code:'',rows:list}))}catch{}return list}
 return{who,sidOf,nameOf,activeClass,better,submit,rows};
})();
