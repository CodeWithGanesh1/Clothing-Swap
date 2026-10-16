# Reweave — Clothing Exchange & Swap Marketplace

Full-stack MERN project (MongoDB, Express, React, Node.js) built as per the
Clothing Exchange & Swap Marketplace requirement document.

## Pages included
1. **Landing Page** (public homepage with hero, how-it-works, live latest listings) — shown to logged-out visitors
2. Login / Register
3. Browse Listings (with type, location, search filters)
4. Item Detail (with swap request form + value comparison)
5. **Nearby Swaps** — real interactive map (free OpenStreetMap/Leaflet, no API key needed) showing listings near your city
6. Swap Requests (incoming/outgoing, accept/reject/complete)
7. Negotiation Chat (per swap request, with Report Issue/dispute button)
8. User Dashboard (add/edit/remove your listings, profile stats)
9. Profile (edit name/phone/location/password)
10. Admin Panel (users, listings, swap monitoring & dispute resolution, analytics)

## Features implemented
- JWT authentication (register/login), bcrypt password hashing
- Clothing listing CRUD (add, **edit**, remove) with image URL, brand, size, condition
- Automatic **swap value calculator** (brand tier + condition based) with a
  **side-by-side value comparison** shown before sending a swap request
- Location & category based browsing/filtering
- Swap request lifecycle: pending → accepted/rejected → completed
- Negotiation chat tied to each swap request (polling-based, refreshes every 4s)
- **Report Issue / dispute** button in chat — flags a swap for admin review
- **Profile page** — view/edit name, phone, location, password
- Admin panel: block/unblock users, remove listings, view KPIs, **monitor all
  swap activity**, and **resolve disputes** (mark completed or cancel)

Note: online payment is intentionally NOT implemented — the requirement
document explicitly lists it under "Out of Scope (Phase 1)".

## About the Nearby Swaps map
The map uses **OpenStreetMap + Leaflet** (completely free, no API key or
billing needed) instead of Google Maps. It converts city names to map
coordinates using the free Nominatim geocoding service — this is rate
limited (roughly 1 request/second) and best-effort, so on a slow connection
markers may take a few seconds to appear, and very obscure place names may
not resolve. For a class project this is more than sufficient; a production
app with heavy traffic would eventually want a paid geocoding provider.

## Folder structure
```
clothing-swap/
  backend/   → Express + MongoDB API
  frontend/  → React app
```

## How to run locally

### 1. Backend setup
```bash
cd backend
npm install
cp .env.example .env
```
Edit `.env`:
- `MONGO_URI` → get a free MongoDB Atlas cluster (mongodb.com/atlas), copy the
  connection string here
- `JWT_SECRET` → any random long string

```bash
npm run dev   # or: npm start
```
Server runs on http://localhost:5000

### 2. Frontend setup
```bash
cd frontend
npm install
npm start
```
App runs on http://localhost:3000 and talks to the backend automatically.

If you deploy the backend separately, create a `.env` file in `frontend/` with:
```
REACT_APP_API_URL=https://your-deployed-backend-url.com/api
```

## Making yourself an admin
By default every registered user has role "user". To test the Admin Panel:
1. Register a normal account
2. In MongoDB Atlas (or Compass), open the `users` collection
3. Edit that user's document and change `"role": "user"` to `"role": "admin"`
4. Log out and log back in

## Deployment (as required — "only a live deployed link will be accepted")
- **Backend** → Render.com (free tier): connect your GitHub repo, set root
  directory to `backend`, add the same environment variables, build command
  `npm install`, start command `npm start`
- **Frontend** → Vercel or Netlify: root directory `frontend`, build command
  `npm run build`, output directory `build`, add `REACT_APP_API_URL` env var
  pointing to your deployed backend
- **Database** → MongoDB Atlas free cluster (already used above)

## Notes for viva / explanation
- Swap value calculator logic is in `backend/routes/clothing.js` →
  `calculateSwapValue()` — it's a simple weighted formula (brand tier ×
  condition multiplier), easy to explain and extend.
- Auth is stateless JWT stored in `localStorage` on the frontend and verified
  via `middleware/auth.js` on the backend.
- Chat uses simple polling (fetch every 4 seconds) rather than WebSockets to
  keep the implementation straightforward — mention this as a possible future
  enhancement (Socket.io) if asked.
