# The mailing list

The site is static, so it cannot process a form submission itself. Sign-ups go to **EmailOctopus**, whose free tier covers 2,500 subscribers and 10,000 emails a month with no card — checked September 2026, and worth re-checking, because MailerLite cut its free tier from 1,000 subscribers to 250 in June 2026.

Related: [CMS.md](CMS.md) · [UPDATING.md](UPDATING.md)

---

## What the site does today

Nothing is configured, so `/mailing-list/` asks people to send an email, exactly as it did before. **That is deliberate.** The old Squarespace form failed silently for months, and this one does not replace it until someone has watched a real sign-up arrive.

## Three states, set in `_data/site.yml` (or the "Site details" form)

| Setting | What the page shows |
|---|---|
| nothing | "Send one email" — the honest state the site shipped with |
| `embed_form_id` + `embed_host` | EmailOctopus's own form, inside Francisca's lime panel |
| `signup_url` | A hosted EmailOctopus page: the no-JavaScript fallback, or the whole thing on its own |

**EmailOctopus's embed is a script tag, not an HTML form.** Their older documentation describes a plain `POST` form, and that shape no longer matches what the app generates. Their script posts to `eomail5.com/form/<id>` and expects JSON back, so hand-rolling our own form against that endpoint would mean depending on something they do not document — and it would land the visitor on raw JSON. We use their script instead, and restyle it.

The form ends up in our own DOM rather than an iframe, so `redesign.css` can restyle it through the custom properties EmailOctopus exposes (`--button-colour`, `--field-border-colour`, `--label-colour`, `--font-family`). The `.signup-panel` prefix on those rules exists only to outweigh their stylesheet. The "Powered by EmailOctopus" line stays: the free plan requires it.

## Setting it up

1. Create a free account at [emailoctopus.com](https://emailoctopus.com) and make a list. *(Account creation is yours to do — an agent should not be making accounts in your name.)*
2. **Export the existing subscribers from Squarespace first** and import them. If ccfest.rocks is retired with the list inside it, that is the one thing here that cannot be recovered.
3. Turn on double opt-in, so a wrong address never joins.
4. Click "Add to your website" and copy the id out of the snippet into `embed_form_id`, and its host into `embed_host`.
5. **Submit a real sign-up and watch it appear in EmailOctopus.** Not optional.

## What the form does

EmailOctopus's script renders the form and posts it for you. Verified locally: the form appears inside the panel, carries the email field and their hidden spam trap, and posts to their endpoint. With JavaScript off, the panel falls back to the email instructions instead of showing a dead box.

**Google reCAPTCHA is deliberately off** on this form. It is on by default, it loads Google's script into the page, and Google's terms then require telling visitors about it. The hidden spam trap plus double opt-in covers a list this size. Turn it back on in the form's Settings tab if spam ever becomes a real problem.

Styling lives in `redesign.css` section 6 (`.signup-embed`).

## Sending

Write and send from EmailOctopus, not from Gmail. A public list legally needs an unsubscribe link in every email, and their footer carries one. The free tier puts a small EmailOctopus line in that footer too.
