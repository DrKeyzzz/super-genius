/* Each native channel runs as a guest with disposable storage. No cloud SDK or writes. */
(()=>{
 const memory=()=>{const m=new Map();return {getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>m.set(String(k),String(v)),removeItem:k=>m.delete(String(k)),clear:()=>m.clear(),key:i=>[...m.keys()][i]??null,get length(){return m.size}}};
 Object.defineProperty(window,'localStorage',{value:memory()});Object.defineProperty(window,'sessionStorage',{value:memory()});
 sessionStorage.setItem('music_guest','1');localStorage.setItem('sq_skin_v1',JSON.stringify('medieval'));localStorage.setItem('rooftop:warmed','true');
 // Intros belong to the full games; each monitor visit starts with the challenge audio.
 window.Audio=class {constructor(){this.volume=0;this.paused=true}play(){return Promise.resolve()}pause(){}addEventListener(){}removeEventListener(){}load(){}};
 const contexts=[];const Native=window.AudioContext||window.webkitAudioContext;
 if(Native){window.AudioContext=class extends Native{constructor(...args){super(...args);contexts.push(this)}};window.webkitAudioContext=window.AudioContext;}
 window.superAudioStop=()=>contexts.forEach(c=>{if(c.state!=='closed')c.close().catch(()=>{})});
 window.addEventListener('pagehide',window.superAudioStop);
})();
