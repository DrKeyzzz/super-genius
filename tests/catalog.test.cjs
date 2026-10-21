const assert=require('node:assert/strict');const {catalog,tiers,deck,config}=require('../catalog.js');
assert.equal(catalog.length,20);assert.equal(new Set(catalog.map(c=>c.id)).size,20);assert.equal(new Set(catalog.map(c=>c.engine)).size,6);assert.equal(tiers[2].name,'Super Music Theory Genius');
for(let i=0;i<100;i++){const cards=deck();assert.equal(cards.length,20);assert.equal(new Set(cards.map(c=>c.id)).size,20);for(let j=1;j<cards.length;j++)assert.notEqual(cards[j-1].game,cards[j].game)}
for(const c of catalog){const cfg=config(c,2,'test');assert.equal(cfg.tier,2);assert.equal(cfg.token,'test');assert.ok(cfg.instructions);assert.ok(!/tuner|voice|listen/.test(c.engine));if(c.game==='brain')assert.ok(cfg.level>=5)}
const fs=require('node:fs');for(const game of new Set(catalog.map(c=>c.engine))){const s=fs.readFileSync(__dirname+'/../channels/'+game+'.html','utf8');assert.ok(s.includes("connect-src 'none'"));assert.ok(!/apiKey:\s*'[^']+'/.test(s));assert.ok(s.includes('channel-bootstrap.js'));assert.ok(s.includes('channel-bridge.js'))}
console.log('PASS: 100 balanced decks, complete skill catalog, top-tier mapping, component isolation.');
