# Capoeira Training App — Ship Week

This app is DONE. You built it for yourself. Now you're polishing it and shipping it to your community.
This is not a second project. This is a release. One week, then back to the sound engineer.

---

## What this app does

A training progress tracker and event calendar for capoeiristas. Built by someone who trains, for people who train.

- **Training tracker:** Log sessions across all capoeira styles. Track movements, sequences, music (berimbau, pandeiro, atabaque), songs, and roda performance.
- **Progress system:** Visual progress over time — not gamified, not hustle-y. Honest reflection on where you're growing and where you're stuck.
- **Event calendar:** One central place for workshops, rodas, batizados, and events. No more losing things in WhatsApp chaos.

---

## Business model — Freemium, NO ADS. Ever.

### Free tier (this is what spreads through the community)
- Basic training log — log sessions, add notes
- Event calendar — browse and discover events
- Community events — anyone can submit events

### Premium tier (~€2.99/month or €19.99/year)
- Advanced progress tracking and analytics
- Training history and trends over time
- Detailed movement library with progress per movement
- Custom training plans and goals
- Export training data

### Why no ads
- This was built with care, for a real community. Ads break that trust.
- The capoeira community is tight-knit. Word of mouth is the growth engine, not ad revenue.
- A few hundred paying users at €3/month is more sustainable and more dignified than a million ad impressions.

### Freemium implementation — Stripe Checkout

Use Stripe for payments. No custom payment forms. Keep it dead simple.

#### Architecture
- Store user accounts with an `isPremium` boolean and `stripeCustomerId` field.
- Use Stripe Checkout Sessions for the upgrade flow — user clicks "Upgrade", gets redirected to a Stripe-hosted payment page, comes back to a success page. No credit card forms in our app.
- Use Stripe Webhooks to listen for `checkout.session.completed`, `customer.subscription.deleted`, and `invoice.payment_failed`. Update the user's `isPremium` status accordingly.
- Use Stripe Customer Portal for users to manage their subscription (cancel, update payment method). Link to it from a "Manage subscription" button in settings. Don't build subscription management UI yourself.

#### Pricing — two options, keep it simple
- Monthly: €2.99/month
- Yearly: €19.99/year (save ~44% — show this)

#### What the paywall looks like
- Free users see premium features greyed out or with a subtle lock icon.
- When they tap a locked feature, show a clean modal: "Unlock full progress tracking" with a short list of what they get (3-4 bullet points max), the two pricing options, and a single "Upgrade" button.
- No popups on app open. No countdown timers. No "you're missing out!" language. Respect the user.
- After 2 weeks of free use, show ONE gentle prompt: "Enjoying the app? Premium unlocks deeper tracking." Dismissable forever.

#### Auth
- Use simple email/password auth or magic links. Don't overcomplicate this.
- A user must have an account to use the app (free or premium). This is needed for Stripe integration and for syncing data across devices.

#### Environment
- Store Stripe keys in environment variables, never in code.
- Use Stripe test mode during development, switch to live mode before ship day.

#### What NOT to build
- Don't build a custom billing dashboard.
- Don't build invoice/receipt pages — Stripe handles all of this.
- Don't build trial periods yet. Free tier IS the trial.
- Don't add coupon codes or referral systems. Ship first.

---

## Design principles

- **Warm, grounded, human.** This is capoeira, not a corporate fitness app.
- **Respect the culture.** Capoeira is an art, a tradition, a community. The app should reflect that — not reduce it to reps and sets.
- **Mobile first.** People check this after training, on the bus, in the roda circle. It needs to feel good on a phone.
- **Simple.** If a screen has too many buttons, cut half of them.

---

## Multilingual — 4 languages at launch

Ship in all four. Claude Code handles the translations.

- **English** — global default
- **Português** — the soul of capoeira. This one matters most after English.
- **Deutsch** — your current community
- **Français** — where you're heading next

### i18n rules
- Use translation keys everywhere. No hardcoded strings. Ever.
- Keep translations in a clean JSON or similar structure per language.
- Capoeira terms (roda, batizado, ginga, berimbau, etc.) stay in Portuguese across all languages. Don't translate the culture.
- Auto-detect user language from browser/device, with manual override in settings.
- If a translation is missing, fall back to English.

### What is NOT in scope
- Languages beyond these four. No Spanish, no Italian, no "but what about..." until the app has real users.

---

## This week's scope — ONLY THESE THINGS

1. Polish the UI. Make it feel finished, not prototype-y.
2. Make sure the event calendar works well and is easy to submit to.
3. Add the premium gate — basic paywall, nothing fancy.
4. Add all 4 language translations (EN, PT, DE, FR).
5. Test it yourself for 2 days of actual training.
6. Share it in your capoeira WhatsApp groups.

### What is NOT in scope this week
- New features anyone suggests (write them down, don't build them)
- A marketing website
- Social media promotion
- Additional languages beyond the four
- Perfection

Ship it. Let real people use it. Improve later based on what they actually need.

---

## Reminder

This app already works. You already use it. The hardest part — building it — is done.
The only thing left is the courage to say "here, I made this" to people you respect.
You've done harder things than that.

Now polish it and ship it. Then get back to the sound engineer.
