# The mailing list

The site is static, so it cannot process a form submission itself. Sign-ups go to **EmailOctopus**, whose free tier covers 2,500 subscribers and 10,000 emails a month with no card — checked September 2026, and worth re-checking, because MailerLite cut its free tier from 1,000 subscribers to 250 in June 2026.

Related: [CMS.md](CMS.md) · [UPDATING.md](UPDATING.md)

---

## What the site does today

Nothing is configured, so `/mailing-list/` asks people to send an email, exactly as it did before. **That is deliberate.** The old Squarespace form failed silently for months, and this one does not replace it until someone has watched a real sign-up arrive.

## Three states, set in `_data/site.yml` (or the "Site details" form)

| Setting | What the page shows |
|---|---|
| nothing | "Send one email" — the current honest state |
| `signup_url` | A button to the EmailOctopus hosted page. Safest: no markup of ours to get wrong |
| `form_action` | The form on the page itself, styled to match the site |

`form_action` also needs `email_field` and `honeypot_field`, copied from the same embed code. **EmailOctopus generates those names per form.** Get one wrong and the form still submits, still looks fine, and the sign-up never arrives — the exact failure the old form had.

## Setting it up

1. Create a free account at [emailoctopus.com](https://emailoctopus.com) and make a list. *(Account creation is yours to do — an agent should not be making accounts in your name.)*
2. **Export the existing subscribers from Squarespace first** and import them. If ccfest.rocks is retired with the list inside it, that is the one thing here that cannot be recovered.
3. Turn on double opt-in, so a wrong address never joins.
4. Either copy the hosted page URL into `signup_url` and stop, or click "Add to your website", and copy the `action` URL, the email input's `name`, and the hidden spam-trap input's `name` into the other three fields.
5. **Submit a real sign-up and watch it appear in EmailOctopus.** Not optional.

## What the form does

A plain HTML `POST` — no JavaScript, no iframe, so it works with scripts disabled and keeps Francisca's styling. Verified locally with the POST intercepted: it sends `field_0=<the address>` plus the empty spam-trap field, which is what EmailOctopus expects. After submitting, the browser lands on EmailOctopus's confirmation page.

Styling lives in `redesign.css` section 6 (`.signup-form`, `.signup-trap`).

## Sending

Write and send from EmailOctopus, not from Gmail. A public list legally needs an unsubscribe link in every email, and their footer carries one. The free tier puts a small EmailOctopus line in that footer too.
