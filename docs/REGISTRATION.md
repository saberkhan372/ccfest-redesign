# Registration and donations

Registration for virtual CC Fest runs on **Luma**, replacing Eventbrite. One Luma form takes the RSVP and an optional donation, and Luma emails each guest a personal Zoom join link, reminders and a calendar invite. The site shows that form in a popup on `/register/`.

Related: [CMS.md](CMS.md) · [UPDATING.md](UPDATING.md) · [MAILING-LIST.md](MAILING-LIST.md)

---

## Why Luma

Chosen by Saber on 2026-09-16. Prices were checked that day and are worth checking again before each event.

| | Luma | Site form + EmailOctopus + Ko-fi | Humanitix |
|---|---|---|---|
| Free registrations | $0 | $0 | $0 |
| Donations | Luma keeps 5%, Stripe takes ~2.9% + 30¢ | Ko-fi 0%, Stripe/PayPal processing only | ~3.9% + $1.29 each |
| Donate while registering | Yes | No, a separate step | Yes |
| Zoom link and reminders | Automatic | Hand-sent | Automatic |

Donations go to the organizer, not to a registered charity, so tools limited to nonprofits (Zeffy, Givebutter) don't apply, and the site must **never call donations tax-deductible**. Luma Plus ($59/month billed annually) removes the 5%, which isn't worth it for a few events a year.

## Setting up an event (Saber)

1. **Create the event** in Luma, with the date and a confirmed start and end time.
2. **Choose Zoom as the location.** Connect Zoom at luma.com/settings, then let Luma create the meeting or paste an existing one. Guests register on Luma, not Zoom, and each gets a personal `luma.com/join/…` link.
3. **Connect Stripe** (calendar → Payment → Get Started → Link Existing Account). Until Stripe is connected, the ticket editor has no Paid option. Enter bank or identity details yourself; an agent must not.
4. **Set up donations on the ticket.** Registration → the ticket → Edit → **Paid** → turn on **Flexible Pricing**. Set a Minimum of 0, so people can still register for free, and a Suggested amount, which Luma requires. Guests then see "Suggested Donation $10.00 · Pay what you want".
5. **Ask about the mailing list.** Registration → Custom Questions → Add Question → **Checkbox**, with Required off. The 2026 event asks "Add me to the CC Fest mailing list for news about future events (optional; unsubscribe anytime)". Luma guests don't reach EmailOctopus on their own: export the guest list from Luma (Guests tab) and import only the people who ticked it.
6. **Put it on the site** through Pages CMS, under "Upcoming event":
   - **Registration link:** the event's public Luma URL.
   - **Luma event ID:** the `evt-…` value from Manage event → More → Embed Registration Button. Pasting the whole snippet also works; the site pulls out the ID.
   - **Donation note:** keep it only if step 4 is done, and make sure it says what the money pays for this year.
7. **Test on the live site:** register yourself through the popup, and check that the confirmation email arrives with a join link.

**Several workshop rooms at once:** Luma gives one join link per event. Send guests the room links from Luma before the event, or run each room as its own Luma event.

## What the site does

| `registration_url` | `luma_event_id` | `/register/` shows |
|---|---|---|
| empty | any | "Registration is not open yet" and a mailing-list button |
| set | empty | A Register button linking to Luma in a new tab |
| set | set | A Register button that opens Luma's form in a popup on the page |

- **The page doesn't contact Luma until someone clicks Register.** Only then does `registration.js` load `https://luma.com/embed/event/<id>/simple` into a native `<dialog>`. The form is kept after that, so closing the popup by mistake doesn't lose what someone typed.
- **Why not Luma's own button script:** it has to load on every page view, Escape doesn't close its overlay, and its close button has no label. The iframe address is the one Luma documents for embedding, and the same one its script opens.
- **Without JavaScript**, Register is an ordinary link to Luma. A Cmd- or Ctrl-click also opens Luma in a new tab.
- **Inside the form, Escape does nothing:** keyboard focus is in Luma's frame, which the page can't listen to. Close and the backdrop both work. Escape works while focus is on Close.
- **A school network that blocks luma.com** blocks the popup and the link alike. The popup's footer links to Luma directly for people whose frames are blocked.

Styles are in `redesign.css` §5 (`.registration-dialog`). `scripts/verify.cjs` tests the popup once an event ID is set, and says SKIP until then.
