(function(root){
 const engines={scale:'scale-quest',tidal:'tidal-tones',ear:'earshot-saloon',brain:'brainwaves',score:'rhythm-trainer',roof:'rooftop-runner'};
 const names={scale:'Scale Quest',tidal:'Tidal Tones',ear:'Earshot Saloon',brain:'Brainwaves',score:'The Big Score',roof:'Rooftop Runner'};
 const rows=[
 ['scale','piano','Scale degrees','Find the requested degree on the piano. Major, minor and modes are all in play.'],
 ['tidal','notes','Read the boats','Read three boats on the staff. Watch the clef, accidentals and key signature.'],
 ['brain','scales','Scales and modes','Listen to the scale up and down, then name it. Hear it again if you need to.'],
 ['ear','interval','The dealer’s interval','Listen to the interval, then choose the matching written note from the cards.'],
 ['score','rhythm','Rhythmic dictation','Listen to the full transmission. Two bars. Build its rhythm with the rhythm bank, then check. 4 listens, 3 minutes.'],
 ['roof','rhythm','Rooftop rhythm','Two bars. Tap and HOLD every written note; release for rests. Use Space or the tap pad. A four-beat count-in comes first.'],
 ['scale','build','Build a scale','Build the complete scale on the piano, starting on its root. Submit when every note is in place.'],
 ['brain','chords','Chord Colors','Hear the chord. Identify its quality, even when it is inverted or spread across octaves.'],
 ['tidal','intervals','Written intervals','Identify three written intervals on the moving boats. The staff and key signature determine their spelling.'],
 ['scale','staff','Write the degree','Place the requested note on the staff with the correct accidental. Use the original note controls.'],
 ['score','melody','Melodic dictation','Hear the melody. Two bars. Enter its pitches AND rhythms with the piano and note lengths, then check. 4 listens, 3 minutes.'],
 ['brain','progressions','Chord progressions','The first chord is home. Listen, then place the Roman numerals for all three remaining chords and submit.'],
 ['ear','bluff','Crooked Clara','Compare the written cards with what Clara plays. Decide whether she is fair or cheating.'],
 ['scale','signature','Key signatures','Read, count or write the key signature. Follow the task on the Scale Quest screen.'],
 ['brain','intervals','Intervals by ear','Name the interval you hear. Includes descending and harmonic intervals.'],
 ['roof','notes','Rooftop sight reading','Two bars of pitched sight reading. Use the on-screen piano or its keyboard shortcuts; hold notes for their written length.'],
 ['tidal','piano','Play the boats','Read three staff notes and play them on the piano in the exact octave.'],
 ['brain','synapse','Sharp or Flat?','Five questions, each closer than the last. Two pitches play once (no replays): was the second sharp or flat? Miss one and the channel is lost. The last one is Hairline, 3 cents.'],
 ['scale','degree-name','Name the degree','Read the shown staff note or piano key and identify its scale degree.'],
 ['ear','noon','High Noon','A masked outlaw plays an interval. Pick the matching card before the native showdown clock expires.']
 ];
 const catalog=rows.map(([game,kind,label,instructions],i)=>({id:game+'-'+kind,game,engine:engines[game],name:names[game],kind,label,instructions,number:i+1}));
 // one expert flight; these are the ranks earned along the way (past Mars, past Jupiter, survive all 20)
 const tiers=[{name:'Theory Genius',at:5,where:'Mars',goal:'Get past Mars · 5 right',color:'#9ae6d4'},{name:'Super Theory Genius',at:10,where:'Jupiter',goal:'Get past Jupiter · 10 right',color:'#c5b3ff'},{name:'Super Music Theory Genius',at:20,where:'Pluto',goal:'Survive all 20 challenges',color:'#ffd789'}];
 function shuffled(a,rng=Math.random){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
 function deck(rng=Math.random){const buckets={};for(const c of shuffled(catalog,rng))(buckets[c.game]??=[]).push(c);const out=[];while(out.length<catalog.length){const choices=Object.values(buckets).filter(a=>a.length&&a[0].game!==out.at(-1)?.game);const pool=choices.length?choices:Object.values(buckets).filter(a=>a.length);pool.sort((a,b)=>b.length-a.length);out.push(pool[0].shift())}return out}
 function config(c,tier,token){return {...c,tier,token,count:3,level:({synapse:[2,4,5],intervals:[3,4,5],chords:[4,6,7],scales:[5,6,7],progressions:[2,4,5]}[c.kind]||[0,0,0])[tier],title:c.name+' · '+c.label,clef:c.game==='scale'&&tier===2?'grand':c.game==='tidal'&&tier===2?'grand':'treble'}}
 const api={catalog,tiers,deck,config};if(typeof module!=='undefined')module.exports=api;else root.GeniusCatalog=api;
})(typeof window!=='undefined'?window:globalThis);
