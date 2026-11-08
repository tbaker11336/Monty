# Monty

Voice-first planning and small habits for Android. You talk through what's on your mind, and Monty turns it into tasks, reminders and a gentle daily plan. The plant companion grows as you finish things.

## Repo layout

```
app/      Expo (React Native, TypeScript) app: expo-router, expo-sqlite, Monty plant
core/     pure TypeScript shared by the app and the server: data types, AI-output
          validation, companion growth (planner and habits come next). Tested with Vitest.
server/   one Vercel function, POST /api/structure: transcript text in, validated items out
```

It's an npm workspace, so run `npm install` once at the repo root.

```bash
npm test            # core + server tests
npm run typecheck   # core, server, app
```

## Decisions so far

| Area | Choice |
|---|---|
| App | Expo SDK 58, development builds (not Expo Go) |
| Android package | `com.montyplanner.app` (can still change before the first Play upload) |
| Builds to your phone | EAS Build, `development` profile, gives you an installable APK |
| Server | Vercel, one function, Root Directory `server` |
| AI | Claude API (`claude-opus-5-5`, low effort, structured JSON output, server-side refusal fallback) |
| Leftover minutes | reset each day (assumption) |
| Bubble captures | always go through Review |
| Monty growth | 5 stages (seed, sprout, leafy, bushy, flowering); naps after a missed day, never shrinks |
| Today / Week | separate tabs for now |

## Running the app on your Android phone

You need a free Expo account the first time.

```bash
cd app
npx eas-cli@latest login
npx eas-cli@latest build:configure      # links the project to your Expo account (one time)
npx eas-cli@latest build --profile development --platform android
```

When the build finishes, open the link on your phone and install the APK. Then on your computer:

```bash
cd app
npx expo start --dev-client
```

Open the Monty app on your phone and scan the QR code. Code changes reload live. You only need a new EAS build when native dependencies change.

For a quick look in a desktop browser (layout only, with no microphone or other native features), run `npx expo start --web`.

If Android Studio is installed, `npx expo run:android` with the phone plugged in does the same thing locally.

## Deploying the server to Vercel

1. In Vercel, choose **Add New → Project** and import this GitHub repo.
2. Set **Root Directory** to `server`. Leave "Include files outside the root directory" on, because the server uses `core/`.
3. Under **Environment Variables**, add `ANTHROPIC_API_KEY`. `MONTY_APP_TOKEN` is optional.
4. Deploy. The endpoint is `https://<project>.vercel.app/api/structure`.

`server/vercel.json` already sets the install and build commands, so the shared `core` package gets built.

Test it:

```bash
curl -X POST https://<project>.vercel.app/api/structure \
  -H 'content-type: application/json' \
  -d '{"transcript":"remind me to call the dentist tomorrow and I need to write the project report","today":"2026-11-08","dailyMinutes":20}'
```

The API key only lives on Vercel and never in the app. Transcripts are not logged.

## Build plan

1. **Done:** project setup, theme, navigation, local database, Monty plant, plus the server endpoint and the AI-output validation, with tests
2. **Done:** onboarding (welcome, microphone, bubble, time per day, best time, calendar, reminders), settings saved on the phone, and a Settings screen that reuses the same steps
3. In-app tap to talk, chunking, on-device speech to text, then the floating-bubble feasibility spike
4. Connect the app to the server, Review screen
5. Planner (a pure function, tested) and the main screen
6. Habits, the "make it smaller" nudge, companion growth
7. Calendar and reminders
8. Floating bubble (native module)
9. Polish, accessibility pass, Play Store listing
