# Good Report

The public page for Good Report, a job search service: https://zachmeditates.github.io

The people, companies and numbers in its example are invented.

## What's here

- `index.html`: the home page. Plain HTML, no build step. The first example person is written into the page, so it reads without JavaScript.
- `assets/site.css`: the styles, with a light and a dark theme.
- `assets/site.js`: the theme button, the booking link and the sign-up form.
- `assets/story.js`: picks a different example person on each visit and fills the four steps from the data in the page.
- `assets/og.png`: the picture shown when the link is shared.
- `assets/fonts/`: Archivo and IBM Plex Mono, both under the SIL Open Font License (license files alongside).
- `portfolio/`: a portfolio page, one card per project: the problem, what was done, and the result.
- `qr/`: where the printed QR code points. It forwards to the home page.

## How it works

- The theme button switches between light and dark and remembers the choice in the browser.
- The booking button opens Calendly over the page once Calendly's script has loaded, and is a plain link to the booking page otherwise.
- The sign-up form posts a name and email through Web3Forms. The access key in the page is meant to be public.
- Visits are counted with Cloudflare Web Analytics, which uses no cookies.

## Running it

Open `index.html` in a browser. There is nothing to install.
