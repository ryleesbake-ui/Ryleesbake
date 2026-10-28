# Rylee's Bake

Website for Rylee's Bake, hands-on sourdough classes in Clermont, FL.

A fast, dependency-free static site: plain HTML, CSS and JavaScript, self-hosted fonts and compressed WebP photos. Hosted on GitHub Pages at [ryleesbake.com](https://ryleesbake.com).

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home page: upcoming dates, Sourdough 101 & 201, starter kit, about, private classes, FAQ |
| `booked.html` | Confirmation page Square sends customers to after paying. Shows the date, address, what to bring, and calendar and directions buttons. Hidden from search engines. |
| `404.html` | Not-found page |

## Updating class dates

Everything about the schedule lives in **`assets/js/classes.js`**. Nothing else needs editing.

- **Add a date:** copy an entry in `RB_CLASSES`, change `id` (the date as `YYYY-MM-DD`), `type` (`"101"` or `"201"`), `capacity`, `spotsLeft` and `checkout` (the Square link).
- **After a booking:** lower `spotsLeft`. At `0` the card switches to "Sold out" with a waitlist button.
- **Change a price:** edit `price` under `RB_CLASS_TYPES`. To set a one-off price for a single date, add `price` to that date's entry.
- **Old dates** hide themselves once the class has ended.

Each date also appears in Google search results as an event, generated from the same list.

## Square setup

Each Square checkout link should be a **Collect a payment** link with **Redirect to a website after checkout** turned on, pointing at:

```
https://ryleesbake.com/booked.html?class=YYYY-MM-DD
```

The `class` value is the date's `id` in `classes.js`. It tells the confirmation page which class was booked.

## Assets

- `assets/img/` contains photos as WebP in the sizes the page uses, plus the logo.
- `assets/fonts/` holds Cormorant Garamond and DM Sans (SIL Open Font License).
- `og-image.jpg` is the preview image shown when the link is shared.
