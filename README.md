# Music Theory Super Genius

Local, unpublished first playable build. Open `http://localhost:8770/super-test/` while serving the Music Games folder. Nothing is pushed, hosted, or connected to the production database.

## Play

One progression, three ranks: **Theory Genius**, **Super Theory Genius**, **Super Music Theory Genius**. Each tier has a shuffled deck of 20 playable challenges, covering six original game engines. No consecutive channels from the same game. Survive the deck with three lives to earn its rank and unlock the next tier. Lives reset for the next flight. Three failures crack the window and cause hull failure. Dictation is submission paced, with no arbitrary global timer. Rooftop uses a native four-beat count-in and a two-bar passage, including timing and hold grading; native Earshot High Noon and Brainwaves Sharp or Flat retain their own clocks.

The **Flight lab** selects any tier/channel for review, without earning ranks or saving records. Main flight progress, unlocked tiers and best records are stored locally in `mtg_super_genius_v1`. Resume reopens the next unresolved challenge. End flight abandons that flight but preserves earned ranks. The current local record is shared within this browser, not a per-student online leaderboard.

## Native components

`channels/` freezes the six existing `index.html` files. Each keeps the original game rendering, question generators, input controls and grading. The adapter trims setup/scoreboard chrome, starts the requested mini challenge, and reports a single result to the cockpit. Frozen copies are intentional: another game's later update cannot silently break this game.

`channel-bootstrap.js` supplies disposable in-memory guest storage; original games do not read or change actual student state. Component CSP forbids network connections; Firebase keys are removed from the snapshots. Musical audio uses built-in synthesis (the original sample engines' fallback). Google-hosted fonts are allowed for original notation/styles. Audio contexts close when leaving a channel. Original game files are not edited.

`channel-bridge.js` maps the twenty challenge types to native APIs. The three engines with private IIFEs are unwrapped only in their snapshots. To refresh, run `python3 tools/build_channels.py` from this folder; `channels/manifest.json` records each source checksum. Refreshing requires rerunning checks.

## Difficulty

- Scale Quest: degrees, piano, staff, scale building, degree names, key signature reading/counting/writing. Tier 3 uses all native keys, minor forms and modes; grand staff where applicable.
- Tidal: note-name input, written intervals and exact-octave piano; three boats per challenge. Medium → Hard → Expert, with the native hardest interval level (Hard).
- Earshot: dealer intervals, Clara's cheats and High Noon. Medium → Hard → Expert; all native disguised intervals at Expert.
- Brainwaves: Sharp or Flat, intervals, Chord Colors, progressions, scales/modes. Native advanced levels → harder levels → final levels (including Hairline and all 14 scales).
- Big Score: full rhythm dictation (Easy → Hard → Extreme), full melody dictation (Five-finger → Vault Breaker → Master Cracker). Melody rhythm hints are off. Both pitches and durations must be correct.
- Rooftop: rhythm-only and pitched on-screen-key sight reading (Medium → Hard → Expert), native difficulty tempo 64 BPM. Passing accuracy is 80% → 90% → 95%, with early releases counted as wrong. Two written bars are graded, allowing ties/held notes to finish.

Excluded: Critical Listening Lab, Pick a Voice/singing, Tuner.

## Checks

- `node tests/catalog.test.cjs`: balanced decks, complete catalog, top-tier mapping and component cloud isolation.
- `node tests/flight.test.cjs`: all three tier unlocks, third-miss failure, lab isolation and duplicate-result protection.
- `/super-test/tests/smoke.html`: exercises native correct grading in all 20 channels at all 3 tiers; Rooftop no-input cases must fail. This uses disposable test frames and never earns user ranks. Native test helpers load only with `?component-check=1`.
- Manual: cockpit/Scale Quest, full Master Cracker editor, channel gate, parent feedback and local records.

## Still separate from production integration

Before any publication: confirm pacing and rank criteria with David, complete student/profile-specific persistence, shared history/practice/assignment/test integration, quota-safe online leaderboard and Firestore rules. The local record board is explicitly labeled as device-only. This build does not modify the hub or any existing games. Publishing still requires David saying **publish**.
