/* Test-only: exercise native grading, not a substitute result callback. */
addEventListener('super-check-start',()=>{
 const params=new URLSearchParams(location.search),kind=params.get('kind'),engine=document.body.dataset.superEngine;let tries=0;
 const timer=setInterval(()=>{try{
  if(++tries>500)throw Error('Native answer phase did not become ready');
  if(engine==='scale-quest'){
   const q=S.run.q;
   if(ksQ(q)){if(q.type==='ksbuild')S.ksPlaced=ksWant(q);else S.ksSel=q.ans}
   else if(nameQ(q))S.degSel=q.degree;
   else if(q.type==='build')S.sel=new Set(buildSpec(q).run);
   else if(q.type==='piano')S.sel=new Set([keysOfPc(pcOf(q.answer))[0]]);
   else {S.pos=Array.from({length:CL().max},(_,i)=>i).find(i=>letterAt(i)===q.answer[0]);S.accSel=({2:'##',1:'#',0:'n','-1':'b','-2':'bb'})[accOf(q.answer)]}
   submit();clearInterval(timer);
  }else if(engine==='brainwaves'){
   if(S.phase!=='answer')return;
   if(kind==='chords')cAnswer(S.cur.q);else if(kind==='scales')pAnswerScale(S.cur.k);else if(kind==='intervals')iAnswer(S.cur.n);else if(kind==='synapse')answer(S.cur.dir);else {S.cur.picks=S.cur.chords.map(c=>c.rn);pSubmit()};clearInterval(timer);
  }else if(engine==='earshot-saloon'){
   if(kind==='bluff'){if(S.phase!=='bluff')return;bluffCall(S.hand.bluff.cheat);clearInterval(timer)}else{if(S.phase!=='pick')return;choose(S.hand.cards.findIndex(c=>c.right));clearInterval(timer)}
  }else if(engine==='rhythm-trainer'){
   if(kind==='melody'){S.mel.ans=S.mel.q.notes.map(n=>({...n}));S.mel.checked=false;melUI();els.checkBtn.disabled=false;melCheck()}else {S.answer=[...S.q.cells];updateUI();els.checkBtn.disabled=false;onCheck()};clearInterval(timer);
  }else if(engine==='tidal-tones'){
   if(!canAnswer())return;
   const n=notes[0];if(kind==='intervals')answerIvl(ivlKey(n.ivl));else if(kind==='piano')answerPiano(midiOf(n),pianoKeysFor(midiOf(n),true)[0]);else answer(letterIdx(n.d),n.acc);
   if(!game.running)clearInterval(timer);
  }else if(engine==='rooftop-runner'){
   // No input should fail at the end of the two-bar passage.
   if(!G.running)clearInterval(timer);
  }
 }catch(err){clearInterval(timer);parent.postMessage({nativeCheckError:err.message},location.origin)}},50);
});
