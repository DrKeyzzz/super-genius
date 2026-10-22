# Music Theory Super Genius — 2026-10-21

First playable LOCAL build, following David's “build it.” Nothing published. No remote repo created.

- Single mode, three tiers: Theory Genius → Super Theory Genius → **Super Music Theory Genius**.
- Smaller upper flight window; large cockpit monitor switches into actual native game components. 20 channel types; all six games, no CLL/singing/Tuner.
- Native Scale Quest, Tidal, Earshot, Brainwaves, Big Score rhythm AND melody dictation, Rooftop rhythm AND note reading. Expert tiers map to native hardest levels. Dictation has no time cutoff. Rooftop is two bars with timing/hold grading.
- Three lives, progressive cracks and explosion, tier rewards, local progress/resume/best records. A Flight lab previews every tier/channel without awarding ranks.
- Frozen original game HTML in channels/; guest in-memory storage, removed Firebase keys, CSP prevents cloud connections. No original games or hub changed. Native audio uses synth fallback; sample fetching blocked in component frames.
- Checks: 60/60 native channel/tier grading checks passed; 27/27 affected adapter rechecks passed after final layout/hold/staff fixes. Node catalog and flight-state checks pass (all tier unlocks, third miss, duplicate results, lab isolation).
- Current preview: http://localhost:8770/super-test/ (server over Music Games at 8770).
- Documentation: README.md, docs/current-design.md. The old docs/spec.md modes are superseded; kept for reference. tools/build_channels.py rebuilds snapshots; source checksums in channels/manifest.json.

Next: David tries the actual channels and pacing. 20 challenges/tier, three lives/tier and unlock rules are chosen defaults to review. Before publication: student-specific/profile persistence and shared practice/report/assignment/test integration; quota-safe online leaderboard + Firestore rules. Device board is explicitly local. Do not publish until David says “publish.”

## Second Brain handoff
Canonical vault note: [[Music Theory Super Genius Handoff]] at `~/Documents/Second_Brain/20 Builds/Music Theory Games/Games/Music Theory Super Genius Handoff.md`. Game note [[Super Test]], Now and AI Log are updated. Safe to continue in Claude. The dated handoff is historical.

## 2026-10-21 evening: moving window, pilots, no scroll (commit 8f7a3eb)
Window always moving; right answers (only) fly you further from Earth; sample pilots (SAMPLE_PILOTS in game.js) + YOUR BEST to pass, "Passed NAME!" label; page fits 1366x768 with no scrolling. Sample names must be replaced by the online board before publishing. Waiting on David's reaction.

## 2026-10-21 evening: home page placement (hub 53d7579, super-test 177f170)
Gold border around the six games, challenge plate at top center, red Leaderboard button -> ../super-test/#leaderboard. Hub publish must wait for the game publish.

## 2026-10-21 evening: Sharp or Flat channel = 5 harder questions, no replay (8d350ec)
SF_STEPS in channel-bridge.js (tier 1: 50-12 cents, tier 2: 30-7, tier 3: 18-3). One miss loses the channel. 15/15 brain checks pass.

## 2026-10-21 night: ?unlock=all (test only)
?unlock=all opens all three tiers. MUST be gated to teachers or removed before publishing.

## 2026-10-21 night: ?unlock=all (test only)
?unlock=all opens all three tiers. MUST be gated to teachers or removed before publishing.

## 2026-10-21 night: hull damage + burn-up + END OF LINE
fx.js (HullFX): each miss draws a spreading crack star in the window, throws glass/metal/sparks (fx canvas), heats the cockpit (--heat, #heat overlay, red frame, alarm text, embers at 2 misses). Third miss (not lab): HullFX.burn -> flames, white-hot, blackout, then #eol "END OF LINE" with rank, cleared, farthest point, flight time, best; Launch again / Mission control. Static .crack svg removed. Tests pass.

## 2026-10-21 night: NO SCROLLING in channels
game.js fit(): the channel iframe is laid out on a bigger virtual screen and CSS-transform scaled to the monitor (wide mode; shape-keeping mode, centred, for tables that grow with width like Earshot). body.playing shortens the window to 16svh. Earshot fitGame disabled in channel-bridge.js. All 20 channels fit at 1366x768 (top tier) and 1280x640 (first tier); page never scrolls. 9/9 Earshot checks pass. Smallest scale about 0.5 (Earshot, key signatures).

## 2026-10-21 night: fit fix for clipped controls
His screenshot: Brainwaves progressions buttons cut off at the bottom (Brainwaves clips, it never scrolls). need() now also measures visible buttons/text bottoms (skips full-screen canvases); fit watches every 400 ms for the whole challenge. All 20 channels OK at 1700x960 (top tier) and 1280x640 (first tier).

## 2026-10-22: spacing in the monitor
His screenshot: Scale Quest staff card small at the top with empty space. fit() now grows small content once (up to 1.45x, content box < 78% of height and 85% of width) and centres the visible content; if growing causes overflow (Big Score resizes itself) it returns to 1x. All 20 channels OK (nothing cut, no scroll) at 1700x1100 (top tier) and 1280x640 (first tier).

## 2026-10-22: burn-up shake settles
His report: after the third miss the screen kept shaking on END OF LINE, so it could not be read. body.burning now shakes 2 s (burnshake x22) then eases still over 1 s (burnsettle); still by 3 s, before the blackout and END OF LINE. style.css?v=5. Checked in the browser (transform none from 3.2 s on).

## 2026-10-22: END OF LINE says how far and gives feedback
His ask. END OF LINE now shows: "You made it past <planet>" (same distance the window uses: (tier + correct/20)/3), a route bar Earth > Moon > ... > Pluto with the rocket where you stopped and a white tick at your previous best, a line comparing with your best plus encouragement by how far you got, Rank / Cleared / Flight time, a Strong box (games with no misses this flight) and Practice these (each missed challenge with a link to its game). run.log records each result; run.prevBest is kept in finish(). SpaceFlight.places() added. Tests pass; checked by a driven flight at desktop and phone width (phone scrolls inside the END OF LINE screen only).

## 2026-10-22: ONE EXPERT FLIGHT (his "go with your picks", spec docs/one-flight-spec.md)
Tiers removed. One Launch; every challenge gets config(...,EXPERT=2) (the old top tier). catalog tiers are now rank milestones {at, where, goal}: Theory Genius past Mars (5 right), Super Theory Genius past Jupiter (10 right), Super Music Theory Genius = survive all 20. Ranks kept for good in saved.ranks (save version 2; old local saves start fresh). Distance = correct/20; planets moved to Moon 2, Mars 5, Asteroids 7, Jupiter 10, Saturn 12, Uranus 14, Neptune 17, Pluto ~20. #rankUp banner in the window when a rank is earned mid-flight; feedback says "Rank earned". One best record {correct, lives, ms}: ties by lives then time. Lobby shows the three ranks (earned gold); Flight lab expert only (labTier gone); ?unlock=all removed. Leaderboard shows best flight + ranks. Tests rewritten and pass; driven in browser (banner at 5 right, END OF LINE says next rank at Jupiter). NEXT: dictation length (he does not want a 30 minute flight).

## 2026-10-22: shorter dictation (his picks)
Big Score channels: rhythm 2 bars (was 4) at extreme; melody already 2 bars master. 4 listens per dictation (bridge wraps playQuestion/melPlay; badge shows listens left, button disabled at 0). 3-minute clock (game.js startClock on the channel started message for game score): ring + time in the monitor bar, red under 30 s; running out = miss ("Time ran out"). Bridge ?v=3 in all channels and build_channels.py. Checked both in Flight lab.
