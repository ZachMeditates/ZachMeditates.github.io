# Good Report

The public page for Good Report, a job search service: https://zachmeditates.github.io

This repo holds only the page. The people, companies and numbers in its example are invented.

## What's here

- `index.html`: the whole page. Plain HTML, no build step. The first example person is written into the page, so it reads without JavaScript.
- `assets/site.css`: the styles, including the light, dark and 90s themes.
- `assets/site.js`: the theme button and the sign-up form.
- `assets/story.js`: picks a different example person on each visit and fills the four steps from the data in the page.
- `assets/og.png`: the picture shown when the link is shared.
- `assets/fonts/`: Archivo and IBM Plex Mono, both under the SIL Open Font License (license files alongside).
- `qr/`: where the printed QR code points. It forwards to the home page, so scans are counted on their own.

## Outside services

- Sign-ups are sent by email through Web3Forms. The access key in the page is meant to be public.
- Visits are counted with Cloudflare Web Analytics, which uses no cookies.

## Running it

Open `index.html` in a browser. There is nothing to install.
