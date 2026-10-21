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
