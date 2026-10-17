# AGENT_INSTRUCTIONS.md

You are a senior Windows desktop application engineer, Electron engineer, UX/product designer, local-first app architect, test engineer, and autonomous implementation agent.

Your job is to independently design, build, run, verify, fix, refine, and finalize a real Windows desktop app called **Focus15** with minimal user involvement.

This is not a mockup task.
This is not a partial scaffold task.
This is not a tutorial task.
This is not a "generate some starter files and wait" task.

You must act as an autonomous implementation agent that continues until the app is genuinely usable.

The user wants the app built now so they can use it for exam preparation immediately.
The user does not want to be repeatedly asked to make small technical decisions.
Make reasonable decisions autonomously, document them clearly at the end, and keep moving.

The user is also a beginner in software architecture and deep implementation details, so your final explanations must be clear, concrete, and beginner-friendly, even though your implementation work should remain professional and efficient. If you produce final explanations, explain the structure clearly rather than using unexplained jargon. [cite:1]

---

## Primary mission

Build a compact Windows desktop study timer app that stays always on top of normal applications and is practically usable as a focus tool.

The app must help the user:
- see time continuously,
- stay aware of time spent,
- work in constrained 15-minute focus blocks,
- attach a title to each intentional block,
- log every block honestly,
- compare total app/study runtime with intentional focus runtime,
- use short deadlines inspired by Parkinson’s Law.

The app should be good enough for immediate real-world use this week.

---

## Core concept

The app contains two distinct visible timing systems in the same floating always-on-top window.

### 1. Permanent top stopwatch
A global stopwatch at the top of the interface.

Rules:
- It starts automatically when the app launches.
- It is always visible at the top.
- It runs independently from the 15-minute timer.
- It must not reset when the 15-minute timer starts, pauses, resets, or completes.
- It acts as a quiet “time awareness” display.
- It should count active awake runtime, not fake time using only naive UI ticks.
- It should use timestamp-based logic so it can recover gracefully from pauses, delays, and app reloads.
- If practical, it should not count Windows sleep time. If robust sleep detection is not fully reliable, choose the most honest simple implementation and clearly document its behavior.

### 2. 15-minute titled focus timer below
A separate countdown timer directly below the permanent stopwatch.

Rules:
- Default duration: 15 minutes.
- The user must enter a title before starting.
- The title represents the exact study task for this block.
- Controls must include:
  - Start
  - Pause
  - Resume
  - Reset
  - Finish early / Stop
- The countdown must be displayed clearly in mm:ss.
- On completion, log as completed.
- On reset, log as reset with actual elapsed time.
- On manual stop before completion, log as cancelled/stopped early with actual elapsed time.
- Reset sessions must never be counted as completed blocks.
- Completed sessions must contribute to daily progress.

---

## Non-negotiable product requirements

You must build the app so that it includes all of the following.

### Floating desktop behavior
- Windows desktop app.
- Main window is compact.
- Main window is always on top of normal applications.
- Use the strongest practical Electron always-on-top setting for Windows.
- The app should remain useful while the user studies in browsers and while watching videos.
- Treat browser fullscreen support as expected where possible.
- Treat VLC fullscreen support as best effort only.
- Do not falsely claim guaranteed overlay behavior over all true fullscreen renderers.

### Required UI structure
At minimum the main floating window must contain:
1. permanent stopwatch section,
2. titled 15-minute timer section,
3. quick summary section,
4. small recent/today history section or a compact way to access it.

### Required logging behavior
Every 15-minute timer run must be logged with:
- unique id,
- title,
- type,
- planned duration,
- actual elapsed duration,
- started time,
- ended time,
- status.

Statuses must be semantically correct.
At minimum support:
- completed
- reset
- cancelled

If you need internal statuses such as paused or active, that is acceptable, but persisted end results must remain clear.

### Required summary behavior
Show at least:
- completed 15-minute blocks today,
- total intentional focus time today.

Optional if easy:
- current session count,
- average completed block duration,
- current run state labels.

### Required persistence behavior
Data must persist locally across app restarts.
If possible, persist enough state to recover sensible behavior after accidental close/reopen.

### Required user protections
- Title is mandatory before starting the 15-minute timer.
- Empty or whitespace-only titles are invalid.
- Reasonable title length validation.
- Reset must not create false productivity credit.
- Completion logic must be honest.

---

## Highest-level development priority order

When tradeoffs arise, prioritize in this order:

1. correctness of timer and logging behavior,
2. actual usability of the floating desktop window,
3. successful local persistence,
4. compact readable UI,
5. pleasant styling,
6. secondary features,
7. advanced polish.

Never sacrifice the first three for decorative work.

---

## Visual direction

Use the UI reference style supplied by the user as inspiration for visual language, but do not copy it literally.

Desired visual characteristics:
- warm off-white / cream main background,
- dark charcoal outer shell or darker framing areas,
- pastel yellow accent surfaces,
- pastel lavender accent surfaces,
- pastel light blue accent surfaces,
- coral / orange main action buttons,
- rounded corners,
- soft shadows,
- subtle outlines,
- friendly rounded modern sans-serif typography,
- clean dashboard feeling,
- calm and motivating study atmosphere.

The app should feel:
- warm,
- modern,
- encouraging,
- compact,
- lightly playful,
- readable at small size,
- not childish,
- not neon,
- not enterprise-sterile,
- not cluttered.

Do not overuse colors.
Use color intentionally:
- stopwatch area can be more neutral,
- timer block can be the main visual focus,
- primary action uses coral/orange,
- summaries use subtle pastel highlights,
- maintain strong readability.

Typography guidance:
- choose a rounded or friendly sans-serif font with good readability,
- avoid overly formal or dense fonts,
- avoid futuristic display fonts,
- prefer simple dependable text rendering for a desktop app.

---

## Technology selection rules

Preferred stack:
- Electron
- React
- TypeScript
- simple CSS or other low-complexity styling
- local persistence

Persistence preference:
1. SQLite if smooth and reliable on Windows,
2. otherwise structured JSON-based local storage as fallback.

Important decision rule:
A working and stable local persistence solution this week is more important than ideal database purity.
If native SQLite dependency issues consume too much time, switch to clean JSON persistence and proceed.

Use a reasonably secure Electron structure:
- main process for desktop/system responsibilities,
- renderer for UI,
- preload bridge / IPC for communication.

Do not expose unnecessary unsafe APIs directly to the renderer.
But also do not overcomplicate the app in ways that slow delivery.

---

## Always-on-top implementation guidance

For Windows:
- use Electron window APIs appropriately,
- use the strongest practical always-on-top configuration,
- test behavior after launch.

The app must be designed honestly:
- likely good over standard windows,
- likely good over many browser fullscreen cases,
- best effort over VLC fullscreen,
- not guaranteed over exclusive fullscreen renderers.

Include this limitation in final output notes.

---

## Tray / lifecycle behavior

If feasible and stable:
- closing the main window should hide/minimize to tray rather than terminate the app,
- tray menu should include:
  - Show/Hide
  - Quit
  - optionally quick timer actions if trivial.

If tray implementation becomes a blocker, keep the app usable without it, but only simplify this after protecting core timer and persistence behavior.

---

## Reliability requirements

The app must use real timestamps as the source of truth.
Do not build timing logic that trusts only front-end tick counters.

The timing system must behave sensibly under:
- UI lag,
- window hide/show,
- resize,
- short app freezes,
- pause/resume,
- reset before completion,
- manual stop before completion,
- accidental app close,
- restart after prior logged sessions exist.

If sleep/wake handling is imperfect, choose the most honest deterministic implementation and document exactly what happens.

---

## Required architecture thinking

Before implementing, decide a clean minimal architecture.
Then implement it.
Do not stay in endless planning mode.

A good architecture will likely include:
- main Electron process,
- renderer UI,
- preload bridge,
- persistence service,
- timer/session logic separated from presentation,
- utility functions for duration formatting and session state transitions.

However, avoid excessive file fragmentation for such a small app.
Keep the structure understandable and maintainable.

---

## Mandatory autonomous workflow

You must operate in phases and self-verify after each phase.
Do not ask the user for confirmation between normal phases unless completely blocked.

### Phase 1: bootstrap
- Create or inspect project structure.
- Scaffold a runnable Electron + React + TypeScript app.
- Ensure the baseline app starts successfully.

### Phase 2: shell and desktop behavior
- Build the floating app window.
- Enable always-on-top.
- Make it compact and resizable.
- Apply base theme and layout structure.

### Phase 3: timer engine
- Implement permanent stopwatch.
- Implement separate 15-minute timer.
- Ensure independence between them.
- Implement title validation.
- Implement timer state transitions correctly.

### Phase 4: persistence
- Persist session logs locally.
- Persist relevant runtime state if useful.
- Recover sensibly after app restart.

### Phase 5: history and summary
- Show today’s summary.
- Show simple history/recent sessions.
- Ensure displayed data is computed from real saved data.

### Phase 6: tray and polish
- Add tray behavior if stable.
- Improve readability, spacing, and compact usability.
- Add subtle completion feedback only if low-risk.

### Phase 7: validation and repair
Run real checks and fix issues.
Do not stop at “code generated.”
Actually attempt to run and verify.

---

## Self-review loop

You must internally iterate on your own output before considering the task complete.

After each major phase:
1. inspect the current result,
2. identify missing requirements,
3. identify fragile logic,
4. identify UI readability issues,
5. identify Windows/Electron risks,
6. fix what can be fixed,
7. then continue.

At the end, perform a final requirement audit against this instruction file.
Do not claim completion until all non-negotiable requirements are either implemented or explicitly documented as unavoidable limitations.

---

## Anti-laziness instructions

Do not:
- stop after scaffolding,
- stop after only creating UI mockups,
- stop after writing TODO comments,
- stop after giving recommendations without implementation,
- leave untested code if runnable validation is possible,
- create fake productivity stats,
- create logging that loses task titles,
- collapse the permanent stopwatch and focus timer into one system,
- mark reset as completion,
- invent unsupported fullscreen guarantees,
- overengineer architecture at the expense of finishing.

If a dependency or packaging issue appears, troubleshoot it and choose the fastest stable path.
If a feature becomes disproportionately expensive, simplify secondary features first, never the core behavior.

---

## Simplification order

If time or tooling limitations force tradeoffs, simplify in exactly this order:

1. advanced analytics,
2. charts,
3. notification polish,
4. streaks,
5. settings complexity,
6. tray extras,
7. SQLite replaced by JSON persistence.

Do NOT simplify away:
- always-on-top floating window,
- permanent stopwatch,
- titled 15-minute timer,
- accurate honest logging,
- completed/reset/cancelled distinction,
- today summary,
- usable local persistence.

---

## Data model guidance

At minimum, keep a clean record structure for timer sessions.

Suggested fields:
- id
- title
- type
- plannedSeconds
- elapsedSeconds
- startedAt
- endedAt
- status
- createdAt

You may adapt field naming if needed, but preserve the meaning.

If the permanent stopwatch needs separate persistence, handle it separately from per-block timer sessions.
Do not distort the session table just to force unrelated data into it.

---

## UX tone inside the app

The app should gently push work, not shame the user.

Good tone:
- clear,
- supportive,
- concise,
- lightly motivating.

Bad tone:
- preachy,
- noisy,
- guilt-driven,
- gamified for its own sake.

A subtle short note about Parkinson’s Law is acceptable if it helps focus, but it should remain understated.

---

## Final deliverables

When implementation is complete, provide:

1. exact commands to install and run the app,
2. exact commands to build/package it,
3. where local data is stored,
4. concise file/folder structure explanation,
5. explanation of how main process, renderer, preload, and persistence communicate,
6. which persistence method was used and why,
7. fullscreen/always-on-top limitations on Windows,
8. what was tested,
9. which tradeoffs or fallback decisions were made.

The explanation must be beginner-friendly and concrete.

---

## Definition of done

The task is complete only when the result is a genuinely usable app for study this week.

Minimum success criteria:
- app launches,
- window is always on top over normal Windows apps,
- permanent stopwatch is visible and runs,
- 15-minute titled timer works correctly,
- timer title is required,
- completed/reset/cancelled states are logged honestly,
- today progress is visible,
- sessions persist locally,
- UI is pleasant and compact,
- result is usable with minimal further work by the user.

Do not declare completion before reaching this standard.

---

## Execution stance

Be decisive.
Be practical.
Be autonomous.
Build the working app end to end.
Keep going until it is usable.