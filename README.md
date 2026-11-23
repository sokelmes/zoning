# Store Zoning Planner

Mobile-first web app (PWA) that shows which employee works in which zone of the store, and when. Managers plan with a PIN. Everyone else views it from a link, or from the icon on their phone's home screen.

## Deploy on Netlify (any account)

1. Upload this folder to a GitHub repository (it can be private).
2. In Netlify, go to **Add new project → Import an existing project → GitHub** and pick the repository. The build settings come from `netlify.toml`, so leave the defaults.
3. Go to **Project configuration → Environment variables → Add a variable**. Set the key to `MANAGER_PIN`, the value to the PIN you want (for example 6 digits), and mark it as secret.
4. Go to **Deploys → Trigger deploy → Deploy project** so the PIN is picked up.
5. New Netlify teams make projects **Private** by default, which asks every visitor to log in to Netlify. Go to **Project configuration → General → Visitor access → Project visibility** and set it to **Public** so staff can open the link without an account.
6. Open the `*.netlify.app` link. Tap **Manager**, enter the PIN, and start planning.

Netlify CLI alternative: run `npm install`, then `npx netlify deploy --prod`, then set `MANAGER_PIN` the same way.

## Install on phones

- **iPhone:** open the link in Safari, tap Share, then **Add to Home Screen**.
- **Android:** open it in Chrome, then tap **Install app** (or menu → Install).

## Files

| Path | What it is |
|---|---|
| `public/index.html` | The whole app (UI, logic, EN/ES texts) |
| `public/sw.js` | Service worker, so the app opens offline |
| `public/manifest.webmanifest` + icons | Makes it installable as an app |
| `netlify/functions/plan.mjs` | API `/api/plan`: anyone reads; writing needs `MANAGER_PIN` |
| `netlify.toml` | Publish folder, functions folder, headers (noindex) |

Data is stored in Netlify Blobs (store `zoning`): one document for zones, team and hours, plus one document per week.

## Notes

- Once the project is Public, anyone with the link can see names and schedules. The site is marked `noindex`, so search engines won't list it.
- To change the PIN, edit `MANAGER_PIN` and redeploy. Managers will be asked for the new one.
- Until a manager saves anything, the app shows labelled example data.
