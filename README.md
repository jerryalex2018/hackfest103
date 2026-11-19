This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev# Degradation Watch

Degradation Watch lets residents photograph dirty or damaged public spaces and pin the exact location. When more than 10 different people report the same spot, it is flagged and local authorities are notified by email.

The project is split into three parts that can be built and tested independently:

- **db/**: the MySQL schema.
- **server/**: an Express API that owns the business logic, uploads, and notifications.
- **web/**: a Next.js frontend that talks only to the API.

## Features

- Photo reporting with browser geolocation, so the pin lands on the exact spot.
- Duplicate-safe flagging: a location is flagged once more than 10 distinct users report it. Repeat posts from one person count once.
- Email notification to each authority when a spot is flagged.
- Home page with recent degraded-area photos.
- Map of all pinned locations (Leaflet and OpenStreetMap, no API key needed).
- Flagged list and a detail page for each flagged location.
- Register and log in, with the report page restricted to signed-in users.
- Mobile-first layout, with large tap targets and a camera-ready upload input.

## Tech stack

**Frontend (web/)**
- Next.js 16 (App Router, Turbopack)
- React and TypeScript
- Tailwind CSS v4
- react-leaflet and Leaflet

**Backend (server/), planned**
- Express, mysql2, multer, bcrypt, jsonwebtoken, cors, nodemailer

**Database (db/)**
- MySQL (local development through XAMPP)

## Project structure

```
degradation-watch/
  db/
    schema.sql                  tables: users, locations, reports, authorities, notifications
  server/                       Express API (to be built to the contract below)
    src/
      server.js  app.js
      config/    db.js, env.js
      routes/    auth.js, reports.js, locations.js
      controllers/
      services/  flagService.js, notifyService.js, authService.js
      middleware/ auth.js, upload.js, errorHandler.js
      models/
    uploads/                    saved photos (local development)
    .env
  web/                          Next.js frontend
    public/
      images/                   sample-1.jpg, sample-2.jpg, sample-3.jpg (mock data)
    src/
      app/
        layout.tsx              root layout: navbar, footer, fonts
        globals.css             Tailwind import, brand colors, animations
        page.tsx                /                  home
        report/page.tsx         /report            submit a photo (login required)
        map/page.tsx            /map               all pins
        recent/page.tsx         /recent            latest photos
        flagged/page.tsx        /flagged           flagged list
        flagged/[id]/page.tsx   /flagged/:id       one location and its photos
        about/page.tsx          /about
        login/page.tsx          /login
        register/page.tsx       /register
        api/[...path]/route.ts  proxy from /api/* to the Express server
      components/
        Navbar.tsx  Footer.tsx  HeroSection.tsx  PhotoCard.tsx
        PhotoUploader.tsx  LocationPicker.tsx  FlaggedBadge.tsx
        MapView.tsx  FlaggedDetailView.tsx
      hooks/
        useAsync.ts             shared loading/error/data logic
        useRecentReports.ts  useLocations.ts  useFlaggedLocations.ts
        useLocation.ts  useGeolocation.ts  useAuth.ts  useUploadReport.ts
      lib/
        types.ts                Report, Location, User, LocationDetail
        api.ts                  apiGet and apiPost helpers
        auth.ts                 save, read, and clear the session
        config.ts               USE_MOCKS switch
        mockData.ts             sample data for offline work
    .env.local
    tsconfig.json               alias: @/* -> ./src/*
```

## How the pieces connect

```
Browser  ->  Next.js (localhost:3000)  ->  /api/* proxy  ->  Express (localhost:4000)  ->  MySQL
                                                                 |
                                                                 +-> uploads/ folder
                                                                 +-> SMTP (authority emails)
```

The browser never calls Express directly. Every request goes to `/api/...` on the Next.js server, and the proxy route forwards it to `EXPRESS_API_URL`. This avoids CORS problems and keeps the backend address out of the browser.

Photos are served by Express at `/api/uploads/:filename`, so they also load through the proxy.

## Prerequisites

- Node.js 20.9 or newer (required by Next.js 16) and npm
- XAMPP (for MySQL) or any MySQL 8 server
- Git Bash or a terminal
- A code editor such as VS Code
- A test SMTP service such as Mailtrap, for development email

## Setup

### 1. Database

Start MySQL, then run the schema:

```bash
mysql -u root -p < db/schema.sql
```

Or paste `db/schema.sql` into phpMyAdmin. Then add a test authority:

```sql
INSERT INTO authorities (name, email, region)
VALUES ('Machakos County Environment Office', 'test@example.com', 'Machakos');
```

### 2. Backend (server/)

The backend is not finished yet. Build it against the API contract in the next section. For local work:

```bash
cd server
npm install
npm run dev
```

Create `server/.env`:

```
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=degradation_watch
JWT_SECRET=replace-with-a-long-random-string
```

Before the frontend connects, seed at least 3 users with known passwords, 5 locations (one flagged), and 10 reports with real saved images.

### 3. Frontend (web/)

```bash
cd web
npm install
```

Create `web/.env.local`:

```
NEXT_PUBLIC_USE_MOCKS=true
EXPRESS_API_URL=http://localhost:4000
```

Add three sample photos to `web/public/images/` named `sample-1.jpg`, `sample-2.jpg`, and `sample-3.jpg`.

Start the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Switching from mock data to the real API

1. Make sure Express is running on port 4000.
2. Set `NEXT_PUBLIC_USE_MOCKS=false` in `web/.env.local`.
3. Stop and restart `npm run dev`. Next.js reads `.env.local` only at startup.

## Configuration

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_USE_MOCKS` | web/.env.local | `true` uses sample data, `false` calls the API |
| `EXPRESS_API_URL` | web/.env.local | Address of the backend that the proxy forwards to |
| `PORT`, `DB_*`, `JWT_SECRET` | server/.env | Backend port, database, and token signing |
| SMTP settings | server/.env | Email for authority notifications |

Only variables starting with `NEXT_PUBLIC_` reach the browser. Keep `JWT_SECRET` and database credentials on the server.

## API contract

The frontend depends on this contract, not on any specific backend tool. Any backend that follows it will work.

**General rules**

- All routes are under `/api`.
- Bodies are JSON, except `POST /api/reports`, which is `multipart/form-data`.
- Field names are snake_case.
- Timestamps are ISO 8601 strings.
- Errors return `{ "error": "message" }` with the right status code.
- Never return `password_hash`, or the emails of reporters or authorities.
- Protected routes read `Authorization: Bearer <token>` and return `401` when it's missing or invalid.

**Endpoints**

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | Returns `201` with `{ token, user }`. `400` for bad input, `409` if the email exists. |
| POST | `/api/auth/login` | Returns `200` with `{ token, user }`. `401` for wrong credentials. |
| GET | `/api/auth/me` | Protected. Returns the current user. |
| POST | `/api/reports` | Protected, multipart. Fields: `photo`, `latitude`, `longitude`, optional `description`. Returns `201` with `{ report, location }`. `400`, `401`, or `413` (file over 5 MB). |
| GET | `/api/reports/recent?limit=12` | Newest first. Maximum limit 50. |
| GET | `/api/locations?status=open\|flagged\|resolved` | Optional status filter. |
| GET | `/api/locations/flagged` | Newest flag first. |
| GET | `/api/locations/:id` | Returns `{ location, reports }`, or `404`. |
| GET | `/api/uploads/:filename` | Serves saved photos. |

**Photo upload rules**

- Accept `image/jpeg`, `image/png`, and `image/webp` only. Check the file content, not just the extension.
- Latitude is between -90 and 90. Longitude is between -180 and 180.
- Description is optional, up to 500 characters.
- Save photos under random names, for example with `crypto.randomUUID()`.
- Set `image_url` to a path starting with `/api/uploads/`.
- When a new report arrives, reuse an existing location within about 30 m, or create one.

**Flagging rules**

- A location is flagged when more than 10 distinct users have reported it.
- Once flagged, it never returns to `open` automatically.
- Each authority is emailed once per flag event, and the email is recorded in `notifications`.
- Run the count and status change inside a database transaction so two simultaneous reports can't create duplicate pins.

**Response shapes**

```json
Report = {
  "id": 14,
  "location_id": 3,
  "image_url": "/api/uploads/a1b2c3.jpg",
  "description": "Overflowing bins near the bus stop",
  "latitude": -1.5177,
  "longitude": 37.2634,
  "reporter_name": "Jerry",
  "created_at": "2026-11-19T10:22:00Z"
}

Location = {
  "id": 3,
  "latitude": -1.5177,
  "longitude": 37.2634,
  "status": "flagged",
  "unique_reporters": 11,
  "report_count": 14,
  "flagged_at": "2026-11-19T11:00:00Z",
  "created_at": "2026-11-18T08:00:00Z"
}
```

The full frontend types are in `web/src/lib/types.ts`.

## Testing

**With mock data (no backend needed)**

Keep `NEXT_PUBLIC_USE_MOCKS=true` and check:

- `/` shows the hero and three photo cards.
- `/recent` shows the same cards in a grid.
- `/map` shows three markers. Popups link to `/flagged/[id]`.
- `/flagged` shows Location #1.
- `/flagged/1` shows the header, badge, and photo. `/flagged/99` shows "Location not found".
- `/register` and `/login` both redirect to `/report`.
- `/report` redirects to `/login` in a private window.
- Submitting a photo with a location shows the success card.

**With the real API**

1. Turn off mocks and restart.
2. Register, log in, and submit a photo.
3. Confirm the pin appears on `/map`, the photo on `/recent`, and the location on `/flagged` once it reaches 11 distinct reporters.
4. Open `http://localhost:3000/api/locations` and confirm it returns JSON.

If Express is off, pages show a red "Cannot reach the server" message instead of crashing.

## Building for production

```bash
cd web
npm run build
npm run start
```

The build must pass before deployment. Pages that read URL parameters or use browser-only hooks are wrapped in `<Suspense>`:

- `layout.tsx` wraps `Navbar` because it uses `usePathname`.
- `flagged/[id]/page.tsx` reads `params` inside a `Suspense` boundary.

## Troubleshooting

**`Cannot find module '@/components/...'`**
Check that `tsconfig.json` has `"@/*": ["./src/*"]` and that the components are inside `web/src/`. Then restart the TypeScript server in VS Code (Ctrl+Shift+P, then "TypeScript: Restart TS Server").

**Tailwind classes have no effect**
This project uses Tailwind v4. Check that `src/app/globals.css` starts with `@import "tailwindcss";`. Brand colors are defined with `@theme` in that same file, not in a `tailwind.config.ts`.

**Hydration mismatch warning in the console**
Usually stale code in the browser or the `.next` cache. Stop the dev server, delete `web/.next`, run `npm run dev` again, and hard refresh (Ctrl+Shift+R).

**Build error: `usePathname()` or `useParams()` outside `<Suspense>`**
Wrap the component that reads the runtime value in `<Suspense fallback={...}>`, as described in the build section.

**Map is blank**
Confirm that `leaflet/dist/leaflet.css` is imported in `MapView.tsx`, and check the browser console for tile errors.

**Location permission denied**
Allow location for `localhost` in the browser settings, then try again. Location requires HTTPS or localhost.

**502 from `/api/...`**
Express isn't running, or `EXPRESS_API_URL` points to the wrong port.

## Known limitations

- The navbar always shows "Log in" and "Sign up", even when a user is signed in.
- The success card has no "Report another" button. Reloading `/report` starts a new form.
- The session token is stored in `localStorage`. This is acceptable for a prototype, but production should consider httpOnly cookies.
- Mock login accepts any credentials and saves a fake token. It only works while `NEXT_PUBLIC_USE_MOCKS=true`.
- The backend is specified but not yet built.

## Roadmap

- Show the user's name and a log-out button when signed in.
- Add a reset option after a successful report.
- Add admin pages for marking locations as resolved.
- Add image compression before upload for slow mobile networks.
- Add tests for the flagging logic and the API contract.
- Deploy the frontend (for example, on Vercel), the backend, and the database separately, with production values for `EXPRESS_API_URL` and the secrets.

## License

Add a license before publishing the repository.
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
