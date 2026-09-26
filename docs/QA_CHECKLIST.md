# Forma QA Checklist

## Mobile layout

- Open `http://192.168.100.205:3001` on iPhone Safari while the PC dev server runs with `-H 0.0.0.0`.
- The landing page must show the hero immediately, without blank top space.
- After login, the left desktop sidebar must be hidden.
- Bottom navigation must be visible, fixed, tappable, and no page should scroll sideways.
- The Forma logo must open `/dashboard`, not log the user out.

## Auth and session

- Register with a short password must show a clear minimum length message.
- Login with an existing older password must work even if it has fewer than 10 characters.
- Refresh `/dashboard` after login: user must remain authenticated.
- Close and reopen the browser: user should remain authenticated until the 30-day session expires.
- Use `Iesi din cont`: session must end and protected pages must redirect to `/login`.

## User data separation

- Save one meal on user A.
- Log out, log in as user B: user B must not see user A's meal.
- Save one meal on user B.
- Log back into user A: user A must still see only user A's meal.
- Premium meal plans and workout logs must behave the same way.

## Profile and onboarding

- New users must be redirected to onboarding before dashboard.
- Profile must save sex, age, height, weight, goal, activity, training days, available days, place, level, preferences, and restrictions.
- Dashboard targets must change after profile update.
- Profile update reminder is currently product logic only; scheduled push delivery still needs production infrastructure.

## Nutrition

- Meal text estimate must require at least 3 characters.
- Save meal must write to `/api/food-log` and appear in "Istoric din contul tau".
- Free meal ideas must show remaining daily quota and block after 2 generations.
- Premium users must receive more ideas per generation and no free quota block.

## Workouts

- Workout plan must use available training days from profile.
- Days must be tappable.
- Selected day must show exercises with clear images.
- Marking a workout done must persist for the current week and remain after refresh.

## Premium

- Free users must not access `/premium`; they should see pricing/checkout.
- Premium access must be granted only by verified Stripe webhook or explicit local dev override.
- Generated 3/7 day meal plan must be saved as the active plan and appear on dashboard/meal plan page.
- Food photo analysis must be treated as an estimate and require user confirmation for unclear foods.

## PWA and notifications

- `manifest.webmanifest` must load with 200.
- Browser should offer install where supported.
- iOS installs via Share -> Add to Home Screen.
- Push notification subscription can be saved, but real recurring delivery requires a server cron/job that sends Web Push messages.
- After major UI changes on iPhone, clear website data for the local IP if Safari shows stale cached UI.

## Release gates

- `npm run lint` must pass.
- `npm run build` must pass.
- `npm run test:smoke` must pass while the dev server is running.
- `.env.local` must never be committed or exposed.
