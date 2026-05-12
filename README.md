# W3-html-css — Property Detail Demo

This repository is a small Node + Express static site demonstrating a property detail page with a nearby properties list, Google Maps integration, a date picker, and a responsive booking card.

Live demo: https://w3assignment-02-internship.onrender.com/

## Features
- Nearby properties fetched from server endpoints (`/get-property`).
- Image gallery modal with touch slider on mobile.
- Hotel Datepicker used for check-in / check-out fields and price calculation.
- Google Maps integration with custom Map/Satellite toggle and fullscreen support.
- Responsive layout and UI fixes for mobile/tablet.

## Prerequisites
- Node.js 16+ and npm

## Setup (local)
1. Clone the repo and change into the project folder:

```bash
git clone <your-repo-url>
cd W3-html-css
```

2. Install dependencies:

```bash
npm install
```

3. Provide a Google Maps API key. Create a file named `.env` in the project root with the following content (do NOT commit this file):


4. Start the server:

```bash
npm start
# or
npm run dev
```

5. Open http://localhost:3000 in your browser.

## API Endpoints (development server)
- `GET /get-property` — returns property listings. Accepts query params:
  - `most-popular=true`, `highest-price=true`, or `lowest-price=true` to choose dataset
  - `limit=<number>` to limit results
- `GET /images` — returns a JSON array of image paths used by the gallery.


## Mobile / Tablet Notes
- The app contains responsive CSS and JS to handle booking-card layout, datepicker behavior, and map controls. If a control remains visible when the map collapses on narrow screens, check the CSS breakpoint rules in `public/style.css`.

## Development notes
- Server entry: `server.js`.
- Static site files: `public/`.
- Data files: `data/` (e.g., `most_popular.json`, `highest_price.json`, `lowest_price.json`).

## File structure
Top-level project layout (important files/directories):

```
W3-html-css/
├─ package.json
├─ server.js
├─ .env              # local env (not committed) with GOOGLE_MAPS_API_KEY
├─ README.md
├─ data/
│  ├─ most_popular.json
│  ├─ highest_price.json
│  └─ lowest_price.json
├─ public/
│  ├─ index.html
│  ├─ style.css
│  ├─ script.js
│  ├─ assets/
│  │  └─ images/     # property images referenced by the gallery
│  └─ maps-config.js # served by server to expose API key to client
└─ node_modules/
```


## License & Attribution
This project uses the Google Maps JavaScript API and Hotel Datepicker. Follow their usage and attribution guidelines when deploying to production.

