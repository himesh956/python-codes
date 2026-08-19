# LOCALHIRE — Deployment

## Targets
- Frontend → **Vercel**
- Backend → **Render** (or Railway)
- Database → **MongoDB Atlas**
- File storage → **Cloudinary**

## Backend (Render)
1. Push repo to GitHub.
2. New Web Service on Render, root directory `server/`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all env vars from `server/.env.example` in the Render dashboard
   (never commit real secrets — `render.yaml` marks them `sync: false`
   on purpose).
6. Health check path: `/api/health`.

## Frontend (Vercel)
1. Import repo, root directory `client/`.
2. Framework preset: Vite.
3. Env var: `VITE_API_BASE_URL` → your deployed Render API URL + `/api`.
4. `vercel.json` is already configured to rewrite all routes to
   `index.html` so client-side routing survives page reloads.

## Post-deploy checklist
- [ ] `GET https://<render-url>/api/health` returns `200` with `database: "connected"`
- [ ] Frontend can register/login against the deployed API (check CORS — `CLIENT_URL` env var on the backend must exactly match the deployed frontend URL)
- [ ] Cloudinary resume upload works end-to-end
- [ ] Run `npm run seed` once against the production DB if you want demo data (⚠️ this clears existing data — only do this before real users sign up)