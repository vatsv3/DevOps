# DevOps: GitHub Pages CI/CD

A beginner DevOps project. A tiny static site (Vite + vanilla HTML/CSS/JS) that ships to GitHub Pages through a GitHub Actions pipeline.

The whole point is to feel the two halves of a pipeline:

- **Continuous Integration (CI)** — every push and every pull request is validated by building the site from a clean checkout. If it doesn't build, the check fails.
- **Continuous Deployment (CD)** — when CI passes on `main`, the built `dist/` folder is published to GitHub Pages automatically. No manual upload.

---

## What's in this repo

```
.
├── index.html                # entry HTML
├── src/
│   ├── main.js               # tiny script that writes a build stamp
│   └── style.css             # styles
├── vite.config.js            # sets `base` so asset URLs work on Pages
├── package.json              # scripts + Vite dep
├── .github/workflows/
│   └── deploy.yml            # the pipeline (ci job + deploy job)
└── README.md
```

## Run it locally

Requires Node.js 20+.

```bash
npm install
npm run dev        # local dev server
npm run build      # produces dist/
npm run preview    # serves dist/ locally
```

The first `npm install` creates `package-lock.json`. Commit that file — CI needs it because it uses `npm ci`.

## One-time GitHub setup

1. Push this repo to GitHub (any repo name works; see the note below).
2. In the repo on GitHub, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. No branch to pick, no `gh-pages` branch to create — the workflow handles publishing.

### Match `base` to your repo name

`vite.config.js` sets:

```js
base: '/DevOps/'
```

Because a Project Pages site is served from `https://<user>.github.io/<repo>/`, `base` must equal `/<repo>/` (with the leading and trailing slash) or asset paths will 404. If your repo isn't named `DevOps`, edit that line to match.

## The pipeline

File: `.github/workflows/deploy.yml`

```
push / PR  ──▶  ci (build)  ──▶  deploy (main only)  ──▶  GitHub Pages
```

### `ci` job — runs on every push and PR to `main`

1. Checkout the repo.
2. Set up Node 20 with npm cache.
3. `npm ci` — reproducible install from the lockfile.
4. `npm run build` — Vite builds into `dist/`.
5. On pushes to `main` only, upload `dist/` as a Pages artifact for the deploy job.

If step 3 or 4 fails, the check is red and (for a PR) merging is blocked by convention — that's the "integration" guarantee.

### `deploy` job — runs only for pushes to `main`, after `ci` succeeds

1. Uses the `github-pages` environment.
2. Calls `actions/deploy-pages@v4`, which publishes the artifact uploaded in the CI job.
3. Exposes the live URL on the workflow run summary.

### Permissions and concurrency, briefly

- Workflow-level permissions default to `contents: read`. The `deploy` job additionally requests `pages: write` and `id-token: write`, which are required by `actions/deploy-pages`.
- A `pages` concurrency group prevents two deploys from clobbering each other. `cancel-in-progress: false` lets an in-flight deploy finish.

## Verifying it works

- Open the **Actions** tab on GitHub after a push to `main`. You should see one run with two jobs: `Build (CI)` then `Deploy to GitHub Pages (CD)`.
- On a pull request, only the `ci` job runs — the `deploy` job is skipped. This is the difference between CI and CD in one screen.
- After a successful deploy, the run page shows the Pages URL, typically `https://<your-username>.github.io/<repo-name>/`.

## Try breaking it (on purpose)

Good ways to feel the pipeline:

- Introduce a syntax error in `src/main.js` on a branch, open a PR — CI fails, deploy never runs.
- Rename the repo without updating `base` in `vite.config.js` — deploy succeeds but the live site loads a blank page (assets 404). Fix `base`, push, done.

## Out of scope

Custom domains, secrets beyond the built-in `GITHUB_TOKEN`, Docker, tests/linters, frameworks like React, and any `gh-pages` branch workflow. Add them later once the basic loop feels natural.
